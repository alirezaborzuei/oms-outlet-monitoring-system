async function isWithinRadius(customerId) {
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
        const response = await fetch(`https://localhost:7238/api/Status/customer/${customerId}/latlang`);
        if (!response.ok) {
            console.error("خطا در درخواست API");
            return false;
        }
        
        const { latitude: targetLat, longitude: targetLng } = await response.json();

        // گرفتن موقعیت فعلی کاربر
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude: userLat, longitude: userLng } = position.coords;
                
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
