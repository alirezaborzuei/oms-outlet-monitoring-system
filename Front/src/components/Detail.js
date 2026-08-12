import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItemId, createVisit, uploadFile, checkVisitStatus, clearVisitID } from '../lib/store/itemSlice';
import { updateVisit } from '../lib/store/visitsSlice';
import { usePathname, useRouter } from 'next/navigation';
import Layout from './Layout';
import swal from 'sweetalert';
import Image from 'next/image';
import { API } from '@/config';
import CameraCapture from './CameraCapture'; // Import your new CameraCapture component
import { saveImage, getImages, deleteImage, clearImages } from './db';

async function isWithinRadius(customerId, token) {
  const RADIUS = 100; // شعاع مجاز به متر

  // تابع محاسبه فاصله بین دو مختصات
  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // شعاع زمین بر حسب متر
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // فاصله در متر
  }

  try {
    // درخواست API برای دریافت مختصات هدف بر اساس شماره مشتری
    const response = await fetch(`${API}/Status/customer/${customerId}/latlang`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // اضافه کردن توکن
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error("خطا در درخواست API");
      return false;
    }
    const jsonResponse = await response.json();
    console.log("Response JSON:", jsonResponse);

    // Destructure latitude and longitude
    const { latitude: targetLat, longitude: targetLng } = jsonResponse;
    console.log("Latitude:", targetLat, "Longitude:", targetLng);
    // console.log("SHOP",response)
    // گرفتن موقعیت فعلی کاربر
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude: userLat, longitude: userLng } = position.coords;
        console.log("USER:", userLat, userLng)
        // محاسبه فاصله
        const distance = getDistanceFromLatLonInMeters(userLat, userLng, targetLat, targetLng);

        // اگر فاصله در شعاع 100 متری باشد true برگردان
        resolve(distance <= RADIUS);
      }, error => {
        console.error("خطا در دریافت موقعیت کاربر:", error);
        resolve(false); // در صورت خطا در دریافت موقعیت کاربر، false برگردان
      });
    });

  } catch (error) {
    console.error("خطا در درخواست API:", error);
    return false;
  }
}


const Detail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.user);
  const visitID = useSelector(state => state.item.visitID);
  const [attachments, setAttachments] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, long: null });
  const [locationError, setLocationError] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorComment, setVisitorComment] = useState('');
  const [step, setStep] = useState(visitID ? 2 : 1);
  const [modalImage, setModalImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false); // State to control the camera modal
  const inputFileRef = useRef(null);
  const pathname = usePathname();
  const id = pathname.split('/')[2];

  useEffect(() => {
    const fetchStoredImages = async () => {
      const images = await getImages();
      setAttachments(images.map(item => item.image)); // Assuming your image object has an `image` property
      setPreviewUrls(images.map(item => item.image));
    };

    fetchStoredImages();
  }, []);

  useEffect(() => {
    const storeImages = async () => {
      await clearImages(); // Clear existing images first
      for (const image of attachments) {
        await saveImage(image);
      }
    };
    storeImages();
  }, [attachments]);

  useEffect(() => {
    //console.log(id)

    if (token && id && username) {
      dispatch(fetchItemId({ token, user: username, id: parseInt(id, 10) }));
      dispatch(checkVisitStatus({ token, customerCode: id }));
    }
  }, [dispatch, token, username, id]);

  useEffect(() => {
    const fetchVisitorName = async () => {
      try {
        const response = await fetch(`${API}/Visit/VisitorName`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVisitorName(data[0].pseadi || '');
        } else {
          console.error('Error fetching visitor name:', response.statusText);
          //  swal("Error", "خطا در دریافت نام ویزیتور", "error");
        }
      } catch (error) {
        console.error('Error fetching visitor name:', error);
        swal("Error", "خطا در ارتباط با سرور", "error");
      }
    };

    fetchVisitorName();
  }, [token]);

  const fetchLocation = async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            resolve({ lat, long });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };


  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;

        // Create an Image element to check dimensions
        const img = new Image();
        img.src = imageData;
        img.onload = async () => {
          // Check if the image is horizontal
          if (img.width > img.height) {
            setAttachments(prev => [...prev, imageData]);
            setPreviewUrls(prev => [...prev, imageData]);
            await saveImage(imageData); // Save to OpenDB
          }
          else {
            swal("Error", "لطفاً یک تصویر افقی بارگذاری کنید.", "error");
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDeleteAttachment = async (index) => {
    const idToDelete = index + 1; // Assuming ID starts from 1
    await deleteImage(idToDelete); // Delete from OpenDB
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCapture = async (dataUrl) => {
    setAttachments(prev => [...prev, dataUrl]);
    setPreviewUrls(prev => [...prev, dataUrl]);
    await saveImage(dataUrl); // Save to OpenDB
    setShowCamera(false); // Close the camera modal
  };

/*   const handleNextStep = async () => {

    if (attachments.length === 0) {
      swal("Error", "لطفاً یک تصویر بارگذاری کنید.", "error");
      return;
    }

    // Check if user is within the radius
     const isWithin = await isWithinRadius(id, token);
    if (!isWithin) {
        console.log("کاربر خارج از شعاع مجاز است.");
        swal("Error", "شما خارج از موقعیت مکانی قرار دارید", "error");
        return; // Exit early
    } else {
        console.log("کاربر در شعاع مجاز قرار دارد.");
    } 

    if (!navigator.onLine) {
      swal("Error", "لطفاً به اینترنت متصل شوید.", "error");
      return;
    }

    setLoading(true);

    try {
      let currentVisitID = visitID;

      if (!currentVisitID) {
        currentVisitID = await dispatch(createVisit({ token, customerCode: id })).unwrap();
      }

      if (currentVisitID) {

         const location = await fetchLocation().catch((error) => {
          swal("Error", "موقعیت مکانی در دسترس نیست.", "error");
          console.error(error);
          return null;
        }); 


        if (location) {
          const { lat, long } = location;
          console.log(attachments[0])
          await dispatch(uploadFile({ token, visitID: currentVisitID, file: attachments[0], lat, long }));
          setAttachments([]);
          setPreviewUrls([]);
          localStorage.removeItem('storedImages');
          localStorage.removeItem('storedPreviewUrls');
          setStep(2);

        }
        else {
          swal("Error", "موقعیت مکانی در دسترس نیست.", "error");
        }
      }

    } catch (error) {
      console.error('Error in handling attachment:', error);
      swal("Error", "خطایی در ارسال تصویر رخ داده است.", "error");
    } finally {
      setLoading(false);
    }
  }; */


  const handleNextStep = async () => {
   
    if (attachments.length === 0) {
      swal("Error", "لطفاً یک تصویر بارگذاری کنید.", "error");
      return;
    }
   setLoading(true);
    // Check if user is within the radius
    const isWithin = await isWithinRadius(id, token);
    if (!isWithin) {
      console.log("کاربر خارج از شعاع مجاز است.");
      swal("Error", "شما خارج از موقعیت مکانی قرار دارید", "error");
      return; // Exit early
    } else {
      console.log("کاربر در شعاع مجاز قرار دارد.");
    } 
  
    if (!navigator.onLine) {
      swal("Error", "لطفاً به اینترنت متصل شوید.", "error");
      return;
    }
  
    setLoading(true);
  
    try {
      let currentVisitID = visitID;
  
      if (!currentVisitID) {
        currentVisitID = await dispatch(createVisit({ token, customerCode: id })).unwrap();
      }
  
      if (currentVisitID) {
        let location;
        let attempts = 0;
        const maxAttempts = 3; // Maximum attempts to get location
  
        // Try to fetch the location up to maxAttempts
        while (!location && attempts < maxAttempts) {
          location = await fetchLocation().catch((error) => {
            console.error(error);
            return null; // Return null on error
          });
  
          if (!location) {
            attempts++;
            if (attempts < maxAttempts) {
              swal("Warning", "موقعیت مکانی در دسترس نیست. در حال تلاش مجدد...", "warning");
            } else {
              swal("Error", "موقعیت مکانی پس از چند تلاش در دسترس نیست.", "error");
            }
          }
        }
  
        if (location) {
          const { lat, long } = location;
          console.log(attachments[0]);
          await dispatch(uploadFile({ token, visitID: currentVisitID, file: attachments[0], lat, long }));
          setAttachments([]);
          setPreviewUrls([]);
          localStorage.removeItem('storedImages');
          localStorage.removeItem('storedPreviewUrls');
          setStep(2);
        }
      }
  
    } catch (error) {
      console.error('Error in handling attachment:', error);
      swal("Error", "خطایی در ارسال تصویر رخ داده است.", "error");
    } finally {
      setLoading(false);
    }
  };
  
 /*  const handleFinalSubmit = async () => {
    if (attachments.length === 0) {
      swal("Error", "لطفاً حداقل یک تصویر دیگر بارگذاری کنید.", "error");
      return;
    }

    if (!navigator.onLine) {
      swal("Error", "لطفاً به اینترنت متصل شوید.", "error");
      return;
    }

    if (!visitorName) {
      swal("Error", "لطفا تمامی فیلدها را پر کنید.", "error");
      return;
    }

    setLoading(true);

    try {
      let currentVisitID = visitID;

      if (!currentVisitID) {
        currentVisitID = await dispatch(createVisit({ token, customerCode: id })).unwrap();
      }

      if (currentVisitID) {
      
        const location = await fetchLocation().catch((error) => {
          swal("Error", "موقعیت مکانی در دسترس نیست.", "error");
          console.error(error);
          return null;
        });

        if (location) {
          const { lat, long } = location;
      
          for (let i = 0; i < attachments.length; i++) {
            await dispatch(uploadFile({ token, visitID: currentVisitID, file: attachments[i], lat, long }));
          }

          let data = {
            visitID: currentVisitID,
            visitorComment: visitorComment,
            visitorApprover: visitorName,
            flow: 'Supervisor'
          };
          await dispatch(updateVisit({ token, visitID: currentVisitID, data })).unwrap();
          swal("Success", "تصاویر با موفقیت ارسال شدند.", "success")
            .then(() => {
              setAttachments([]);
              setPreviewUrls([]);
              localStorage.removeItem('storedImages');
              localStorage.removeItem('storedPreviewUrls');
              router.push('/listVisitor');
            });

        } else {
          swal("Error", "موقعیت مکانی در دسترس نیست.", "error");
        }
      }
    } catch (error) {
      console.error('Error in handling attachment:', error);
      swal("Error", "در ارسال تصاویر خطایی رخ داده است.", "error");
    } finally {
      setLoading(false);
    }
  }; */


  const handleFinalSubmit = async () => {
    if (attachments.length === 0) {
      swal("Error", "لطفاً حداقل یک تصویر دیگر بارگذاری کنید.", "error");
      return;
    }
  
    if (!navigator.onLine) {
      swal("Error", "لطفاً به اینترنت متصل شوید.", "error");
      return;
    }
  
    if (!visitorName) {
      swal("Error", "لطفا تمامی فیلدها را پر کنید.", "error");
      return;
    }
  
    setLoading(true);
  
    try {
      let currentVisitID = visitID;
  
      if (!currentVisitID) {
        currentVisitID = await dispatch(createVisit({ token, customerCode: id })).unwrap();
      }
  
      if (currentVisitID) {
        let location;
        let attempts = 0;
        const maxAttempts = 3; // Maximum attempts to get location
  
        // Try to fetch the location up to maxAttempts
        while (!location && attempts < maxAttempts) {
          location = await fetchLocation().catch((error) => {
            console.error(error);
            return null; // Return null on error
          });
  
          if (!location) {
            attempts++;
            if (attempts < maxAttempts) {
              swal("Warning", "موقعیت مکانی در دسترس نیست. در حال تلاش مجدد...", "warning");
            } else {
              swal("Error", "موقعیت مکانی پس از چند تلاش در دسترس نیست.", "error");
            }
          }
        }
  
        if (location) {
          const { lat, long } = location;
  
          // Upload all attachments
          for (let i = 0; i < attachments.length; i++) {
            await dispatch(uploadFile({ token, visitID: currentVisitID, file: attachments[i], lat, long }));
          }
  
          let data = {
            visitID: currentVisitID,
            visitorComment: visitorComment,
            visitorApprover: visitorName,
            flow: 'Supervisor'
          };
          await dispatch(updateVisit({ token, visitID: currentVisitID, data })).unwrap();
          swal("Success", "تصاویر با موفقیت ارسال شدند.", "success")
            .then(() => {
              setAttachments([]);
              setPreviewUrls([]);
              localStorage.removeItem('storedImages');
              localStorage.removeItem('storedPreviewUrls');
              router.push('/listVisitor');
            });
  
        } else {
          // If location is still not available
          swal("Error", "موقعیت مکانی در دسترس نیست.", "error");
        }
      }
    } catch (error) {
      console.error('Error in handling attachment:', error);
      swal("Error", "در ارسال تصاویر خطایی رخ داده است.", "error");
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    dispatch(clearVisitID());
    // router.push('/listVisitor');
    router.back();
  };

  const openImageInModal = (url) => {
    setModalImage(url);
  };

  const closeModal = () => {
    setModalImage(null);
  };
  const rotateImage = (imageSrc, degrees) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image(); // استفاده از window.Image
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Adjust canvas size based on rotation
        if (degrees === 90 || degrees === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Translate and rotate
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
    });
  };

  const handleRotateAttachment = async (index, degrees) => {
    const rotatedImage = await rotateImage(attachments[index], degrees);
    setAttachments(prev => prev.map((img, i) => (i === index ? rotatedImage : img)));
    setPreviewUrls(prev => prev.map((url, i) => (i === index ? rotatedImage : url)));
    await saveImage(rotatedImage); // ذخیره‌ی تصویر چرخش‌یافته در پایگاه داده
  };


  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10" style={{ direction: 'rtl' }}>
        {step === 1 ? (
          <>
            <h1 className="text-3xl font-bold mb-4">آپلود تصویر سردر فروشگاه</h1>
            <p className="text-red-500 mb-4">لطفاً تصویر سردر فروشگاه را به صورت افقی بارگذاری کنید.</p>

            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="object-cover w-full h-full rounded cursor-pointer"
                    onClick={() => openImageInModal(url)}
                  />
                  <button
                    onClick={() => handleDeleteAttachment(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => handleRotateAttachment(index, 90)} // چرخاندن عکس به میزان 90 درجه
                    className="absolute top-0 left-0 bg-blue-500 text-white p-1 rounded"
                  >
                    چرخش
                  </button>
                </div>
              ))}

              {attachments.length < 1 && (
                <button
                  onClick={() => setShowCamera(true)} // Open camera when 'Start' is clicked
                  className="flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 p-4 rounded h-40 w-40"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleAttachmentChange}
              ref={inputFileRef}
              className="hidden"
            />

            <div className="mt-4 flex justify-between">
              <button onClick={handleBack} className="mt-4 bg-gray-500 text-white p-2 rounded">
                بازگشت
              </button>
              <button onClick={handleNextStep} className="mt-4 bg-blue-500 text-white p-2 rounded">
                {loading ? 'در حال بارگذاری...' : 'ادامه'}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">بارگذاری تصاویر اضافی</h1>
            <p className="text-red-500 mb-4">لطفاً تصاویر اضافی فروشگاه را بارگذاری کنید.</p>
            <p className="text-red-500 mb-4">لطفاً تصاویر  فروشگاه را به صورت افقی بارگذاری کنید.</p>


            <div className="grid grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={url}
                    alt="Preview"
                    width={200}
                    height={150}
                    className="object-cover w-full h-full rounded cursor-pointer"
                    onClick={() => openImageInModal(url)}
                  />
                  <button
                    onClick={() => handleDeleteAttachment(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => handleRotateAttachment(index, 90)} // چرخاندن عکس به میزان 90 درجه
                    className="absolute top-0 left-0 bg-blue-500 text-white p-1 rounded"
                  >
                    چرخش
                  </button>
                </div>
              ))}

              <button
                onClick={() => setShowCamera(true)} // Open camera when 'Start' is clicked
                className="flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 p-4 rounded h-40 w-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleAttachmentChange}
              ref={inputFileRef}
              className="hidden"
            />

            <div className="mt-4">
              <label className="block mb-2">نام ویزیتور:</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-2">نظر ویزیتور:</label>
              <textarea
                value={visitorComment}
                onChange={(e) => setVisitorComment(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={handleBack} className="bg-gray-500 text-white p-2 rounded">
                بازگشت
              </button>
              <button onClick={handleFinalSubmit} className="bg-blue-500 text-white p-2 rounded">
                {loading ? 'در حال بارگذاری...' : 'ارسال نهایی'}
              </button>
            </div>
          </>
        )}
      </div>

      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" onClick={closeModal}>
          <Image src={modalImage} alt="Fullscreen" width={1280} height={720} className="rounded" />
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Layout>
  );
};

export default Detail;


