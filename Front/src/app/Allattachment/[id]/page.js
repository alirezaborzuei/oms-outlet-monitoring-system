"use client";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { fetchAllAttachments, resetAttachments, setFilters, setSortOptions } from '@/lib/store/attachmentsSlice';
import Pagination from '@/components/Pagination';
import Layout from '@/components/Layout';
import AuthWrapper from '@/components/AuthWrapper';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import debounce from 'lodash/debounce';
import ImageModal from '@/components/ImageModal';


const List = () => {
  const dispatch = useDispatch();
  const { attachments, totalCount, pageSize, totalPages, currentPage, sortOptions } = useSelector(state => state.attachments);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.token);
  const [viewMode, setViewMode] = useState('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const itemsPerPage = pageSize;
  const pathname = usePathname();
  const distCode = pathname.split('/').pop();
  const [musterino, setMusterino] = useState('');
  const filters = useSelector(state => state.attachments.filters);
  const [flow, setFlow] = useState('');
  const [standardName, setStandardName] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('musterino');
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchAllAttachments({ token, pageNumber: currentPage, pageSize: itemsPerPage, distCode, filters, sortOptions }));
    }
  }, [dispatch, isAuthenticated, token, currentPage, distCode, filters, sortOptions, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      dispatch(fetchAllAttachments({ token, pageNumber, pageSize: itemsPerPage, distCode, filters, sortOptions }));
    }
  };
  const handleSearch = () => {
    const updatedFilters = {
      filterColumn: selectedFilter,
      filterValue: searchTerm,
    };

    dispatch(resetAttachments());
    dispatch(setFilters(updatedFilters));

    dispatch(fetchAllAttachments({
      token,
      pageNumber: 1, // Reset to first page
      pageSize: itemsPerPage,
      distCode,
      filters: updatedFilters,
      sortOptions,
    }));
  };


  // Handle filter change and fetch data
  const handleFilterChange = useCallback((filterColumn, filterValue) => {
    const updatedFilters = {
      filterColumn: filterColumn,
      filterValue: filterValue,
    };

    console.log("Updated Filters:", updatedFilters);

    dispatch(resetAttachments());
    dispatch(setFilters(updatedFilters)); // Ensure this updates the filters correctly

    dispatch(fetchAllAttachments({
      token,
      pageNumber: 1, // Start from page 1 when filter changes
      pageSize: itemsPerPage,
      distCode,
      filters: updatedFilters,
      sortOptions,
    }));
  }, [dispatch, token, itemsPerPage, distCode, sortOptions]);

  // Debounced version of handleFilterChange
  const debouncedHandleFilterChange = useCallback(
    debounce((filterColumn, filterValue) => {
      handleFilterChange(filterColumn, filterValue);
    }, 300), // Adjust debounce delay as needed
    [handleFilterChange]
  );

  // Event handler for input change
  const handleChange = (e) => {
    const { value } = e.target;
    setMusterino(value);
    debouncedHandleFilterChange('musterino', value);
  };

  // Event handler for input blur
  const handleBlur = () => {
    handleFilterChange('musterino', musterino);
  };

  const handleSortChange = (sortColumn) => {
    const newSortOptions = {
      sortColumn,
      sortOrder: sortOptions.sortColumn === sortColumn && sortOptions.sortOrder === 'asc' ? 'desc' : 'asc',
    };

    dispatch(resetAttachments());
    dispatch(setSortOptions(newSortOptions));

    dispatch(fetchAllAttachments({
      token,
      pageNumber: currentPage,
      pageSize: itemsPerPage,
      distCode,
      filters,
      sortOptions: newSortOptions,
    }));
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImageIndex(null);
  };

  const handlePrev = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? attachments.length - 1 : prevIndex - 1));
  }, [attachments]);

  const handleNext = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex === attachments.length - 1 ? 0 : prevIndex + 1));
  }, [attachments]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      closeModal();
    }
  }, [handlePrev, handleNext]);

  useEffect(() => {
    if (modalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen, handleKeyDown]);



  // For displaying date in a readable format (MM/DD/YYYY)
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US'); // You can adjust the locale for other formats
  };

  // On filter change
  const handleDateChange = (e) => {
    const selectedDate = e.target.value; // The value from the date input will be in 'YYYY-MM-DD'
    handleFilterChange('imageUploadDate', selectedDate); // Make sure you use 'YYYY-MM-DD' for filtering
  };

  return (
    <Layout>
      <AuthWrapper>
        <div className="p-4">
          {/*    <div className="flex flex-col md:flex-row-reverse mb-4 items-start">
            <div className="flex mb-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded mr-2"
              >
                <option value="musterino">Customer Code</option>
                <option value="imageStandardName">Standard Name</option>
                <option value="flow">Flow</option>
                <option value="imageUploadDate">Upload Date</option>
           
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="p-2 border border-gray-300 rounded mr-2"
              />
              <button
                onClick={handleSearch}
                className="p-2 bg-blue-600 text-white rounded"
              >
                Search
              </button>
            </div>
          </div> */}

          <div className="flex justify-end mb-4 items-center">
            <div className="relative flex items-center">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="musterino">Customer Code</option>
                <option value="imageStandardName">Standard Name</option>
                <option value="flow">Flow</option>
                <option value="imageUploadDate">Upload Date</option>
                {/* Add more options as needed */}
              </select>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" // Fixed width for consistent size
              />

              <button
                onClick={handleSearch}
                className="ml-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 2a9 9 0 100 18 9 9 0 000-18zM21 21l-6-6"
                  />
                </svg>
              </button>
            </div>
          </div>


          {viewMode === 'list' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageStandardName')} className="flex items-center">
                      Image
                      {sortOptions.sortColumn === 'imageStandardName' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageStandardName')} className="flex items-center">
                      StandardName
                      {sortOptions.sortColumn === 'imageStandardName' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageStandardName')} className="flex items-center">
                      StandardName
                      {sortOptions.sortColumn === 'imageStandardName' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                    {/*    <input
                      type="text"
                      value={standardName}
                      onChange={(e) => setStandardName(e.target.value)}
                      onBlur={() => handleFilterChange('imageStandardName', standardName)}
                      className="mb-2 p-1 text-sm border border-gray-300 rounded w-62"
                    /> */}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('musterino')} className="flex items-center">
                      Customer Code
                      {sortOptions.sortColumn === 'musterino' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                    {/*   <input
                      type="text"
                      //placeholder="Filter by Musterino"
                      value={musterino}
                      onChange={handleChange}
                      onBlur={handleBlur} // Call handleBlur on focus out
                      className="mb-2 md:mb-0 md:mr-2 p-1 text-sm border border-gray-300 rounded w-32" // Smaller padding, smaller text, and reduced width
                    /> */}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('flow')} className="flex items-center">
                      Flow
                      {sortOptions.sortColumn === 'flow' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                    {/*  <input
                      type="text"
                      value={flow}
                      onChange={(e) => setFlow(e.target.value)}
                      onBlur={() => handleFilterChange('flow', flow)}
                      className="mb-2 p-1 text-sm border border-gray-300 rounded w-32"
                    /> */}
                  </th>

                  {/*   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('flow')} className="flex items-center">
                      Flow
                      {sortOptions.sortColumn === 'flow' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th> */}
                  {/*    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageUploadDate')} className="flex items-center">
                      Upload Date
                      {sortOptions.sortColumn === 'imageUploadDate' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  </th> */}
                  {/*  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageUploadDate')} className="flex items-center">
                      Upload Date
                      {sortOptions.sortColumn === 'imageUploadDate' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      onBlur={() => handleFilterChange('imageUploadDate', uploadDate)}
                      className="mb-2 p-1 text-sm border border-gray-300 rounded w-32"
                    />
                  </th> */}

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSortChange('imageUploadDate')} className="flex items-center">
                      Upload Date
                      {sortOptions.sortColumn === 'imageUploadDate' && (
                        <span>{sortOptions.sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>

                    {/*    <input
                      type="text"
                      value={uploadDate} // This should be 'YYYY-MM-DD' format for the input
                      onChange={handleDateChange}
                      className="mb-2 p-1 text-sm border border-gray-300 rounded w-32"
                    /> */}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attachments.map((attachment, index) => (
                  <tr key={attachment.id}>
                    <td className="px-4 py-3" onClick={() => openModal(index)}>
                      <Image src={`data:image/jpeg;base64,${attachment.imageDataBase64}`} alt={attachment.standardName} width={50} height={50} />
                    </td>
                    <td className="px-4 py-3">{attachment.imageStandardName}</td>
                    <td className="px-4 py-3">{attachment.musterino}</td>
                    <td className="px-4 py-3">{attachment.flow}</td>
                    {/*  <td className="px-4 py-3">{new Date(attachment.imageUploadDate).toLocaleDateString()}</td> */}
                    <td className="px-4 py-3">
                      {formatDate(attachment.imageUploadDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/photo/${attachment.visitID}`} className="text-blue-600 hover:underline">View Visit Folder</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attachments.map((attachment, index) => (
                <div key={attachment.id} className="border p-4 rounded">
                  <div onClick={() => openModal(index)} className="cursor-pointer">
                    <Image src={`data:image/jpeg;base64,${attachment.imageDataBase64}`} alt={attachment.standardName} width={200} height={200} />
                  </div>
                  <h3 className="text-lg font-semibold mt-2">{attachment.imageStandardName}</h3>
                  <p className="text-sm">{attachment.musterino}</p>
                  <p>{attachment.distkodu}</p>
                  <p className="text-sm">{attachment.flow}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/*  {modalOpen && currentImageIndex !== null && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 cursor-pointer"
            onClick={closeModal}
          >
            <div
              className="relative bg-white p-6 rounded shadow-lg max-w-3xl w-full max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing on inner clicks
            >
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-white font-bold bg-red-500 px-4 py-2 rounded z-50"
              >
                Close
              </button>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-bold bg-black px-4 py-2 rounded z-50"
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold bg-black px-4 py-2 rounded z-50"
              >
                Next
              </button>
              <div className="relative w-full h-80">
                <Image
                  src={`data:image/jpeg;base64,${attachments[currentImageIndex].imageDataBase64}`}
                  alt={attachments[currentImageIndex].imageStandardName}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="mt-4 text-center">
                <p>{attachments[currentImageIndex].imageStandardName}</p>
                 <p>{attachments[currentImageIndex].musterino}</p>
                <p>{attachments[currentImageIndex].distkodu}</p>
                <p>{attachments[currentImageIndex].flow}</p> 
                <Link href={`/photo/${attachments[currentImageIndex].visitID}`} className="text-blue-600 hover:underline">View Details</Link>
              
              </div>

            </div>

          </div>
        )}  */}

        {modalOpen && currentImageIndex !== null && (
          <ImageModal isOpen={modalOpen} onClose={closeModal} token={token} distCode={distCode} index={currentImageIndex} />)}


        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </AuthWrapper>
    </Layout>
  );
};
export default List;