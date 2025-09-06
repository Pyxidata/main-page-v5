import { useEffect, useState } from "react";

export const useGeoLocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const estimateLongitudeFromTimezone = (): number => {
    const offsetMinutes = new Date().getTimezoneOffset();
    const offsetHours = offsetMinutes / 60;
    return -(offsetHours * 15);
  };

  const fetchLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLoading(false);

          setLatitude(0);

          const estimatedLon = estimateLongitudeFromTimezone();
          setLongitude(estimatedLon);

          if (err.code === err.PERMISSION_DENIED) {
            setError(`Location access denied. Defaulting to Latitude: 0, Estimated Longitude (from timezone): ${estimatedLon.toFixed(6)}.`);
          } else {
            setError(`Could not retrieve location: ${err.message}. Defaulting to Latitude: 0, Estimated Longitude (from timezone): ${estimatedLon.toFixed(6)}.`);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLoading(false);
      setLatitude(0);
      const estimatedLon = estimateLongitudeFromTimezone();
      setLongitude(estimatedLon);
      setError(`Geolocation is not supported by your browser. Defaulting to Latitude: 0, Estimated Longitude (from timezone): ${estimatedLon.toFixed(6)}.`);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { latitude, longitude, loading, error, refetchLocation: fetchLocation };
};