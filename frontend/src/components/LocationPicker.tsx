import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [error, setError] = useState<string>('');

  const getAddressFromCoordinates = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        setAddress(address);
        onLocationSelect({ latitude: lat, longitude: lng, address });
      }
    });
  }, [onLocationSelect]);

  useEffect(() => {
    const initMap = () => {
      const mapElement = document.getElementById('location-map');
      if (!mapElement) return;

      const defaultCenter = initialLocation?.latitude && initialLocation?.longitude
        ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
        : { lat: 40.7128, lng: -74.0060 }; // New York City as default
      
      const newMap = new google.maps.Map(mapElement, {
        zoom: 15,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      setMap(newMap);

      // Add initial marker if location is provided
      if (initialLocation?.latitude && initialLocation?.longitude) {
        const initialMarker = new google.maps.Marker({
          position: { lat: initialLocation.latitude, lng: initialLocation.longitude },
          map: newMap,
          draggable: true,
        });
        setMarker(initialMarker);
      }

      // Add click listener to map
      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }

          // Add new marker
          const newMarker = new google.maps.Marker({
            position: { lat, lng },
            map: newMap,
            draggable: true,
          });
          setMarker(newMarker);

          // Get address from coordinates
          getAddressFromCoordinates(lat, lng);
        }
      });
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps API if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [initialLocation?.latitude, initialLocation?.longitude, getAddressFromCoordinates, marker]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);

          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }

          // Add new marker
          const newMarker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            draggable: true,
          });
          setMarker(newMarker);

          getAddressFromCoordinates(lat, lng);
        }
      },
      (error) => {
        setError('Error getting current location: ' + error.message);
      }
    );
  };

  const handleAddressSearch = () => {
    if (!address.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);

          // Remove existing marker
          if (marker) {
            marker.setMap(null);
          }

          // Add new marker
          const newMarker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            draggable: true,
          });
          setMarker(newMarker);

          onLocationSelect({ latitude: lat, longitude: lng, address });
        }
      } else {
        setError('Address not found. Please try a different address.');
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Location
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address or landmark"
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleAddressSearch}
              disabled={!address.trim()}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={getCurrentLocation}
            >
              Use Current Location
            </Button>
          </Box>
        </Box>

        <Box
          id="location-map"
          sx={{
            width: '100%',
            height: '300px',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Click on the map to select a location, or search for an address above.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
