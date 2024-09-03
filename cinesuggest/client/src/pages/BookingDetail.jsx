import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import CenteredBackdrop from '../components/common/CenteredBackdrop.jsx';
import tmdbConfigs from '../api/configs/tmdb.configs';
import mediaApi from '../api/modules/media.api';
import bookingApi from '../api/modules/booking.api';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';
import { toast } from 'react-toastify';
import { setAuthModalOpen } from "../redux/features/authModalSlice";

const theatres = ["PVR", "INOX", "CINEMARC"];
const languages = ["Hindi", "English"];
const formats = ["2D", "3D"];
const mockShowtimes = ["9:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"];

const BookingDetail = () => {
  const { mediaId } = useParams();
  const dispatch = useDispatch();
  const [media, setMedia] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);
  const [onRequest, setOnRequest] = useState(false);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch movie details only once when the component mounts
    const getMedia = async () => {
      if (!mediaId) {
        toast.error("Media ID not found in the URL");
        return;
      }

      dispatch(setGlobalLoading(true));
      const { response, err } = await mediaApi.getDetail({ mediaType: "movie", mediaId: mediaId });
      dispatch(setGlobalLoading(false));

      if (response) {
        setMedia(response);
        setShowtimes(mockShowtimes); // Set showtimes once media is fetched
      }

      if (err) toast.error(err.message);
    };

    getMedia();
  }, [mediaId, dispatch]);

  // Handle showtime selection
  const handleShowtimeSelect = (time) => {
    setSelectedShowtime(time);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Optionally, you can fetch updated showtimes based on the date
    // This can be refined or removed based on how you actually want to handle showtimes
  };

  const handleBookNow = async () => {
  if (!user) return dispatch(setAuthModalOpen(true));

  if (onRequest) return;

  setOnRequest(true);
  try {
    if (selectedDate && selectedTheatre && selectedShowtime ) {
      const body = {
        mediaId: mediaId,
        mediaTitle: media.title,
        mediaPoster: media.poster_path,
        showtime: selectedShowtime,
        theater: selectedTheatre,
        language: selectedLanguage,
        format: selectedFormat,
        bookingDate: selectedDate.toDateString(),
      };
      const { response, err } = await bookingApi.add(body);
      if (err) throw new Error(err.message);
      if (response) {
        toast.success("Booking successful!");
      }
    }
  } catch (error) {
    toast.error(`Booking failed: ${error.message}`);
  } finally {
    setOnRequest(false);
  }
};

  const isBookingEnabled = selectedDate && selectedTheatre && selectedShowtime;

  return (
    media && (
      <>
        <CenteredBackdrop
          imgPath={tmdbConfigs.backdropPath(media.backdrop_path)}
          title={media.title}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 2,
            }}
          >
            {/* Language, Format, and Theatre Selection */}
            <Box sx={{ display: 'flex', width: '100%', marginBottom: '1rem' }}>
              {/* Date Selection */}
              <Box sx={{ flex: 1, width: '100%', marginBottom: '1rem' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Select Date
                </Typography>
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={10}
                  slidesPerView="auto"
                  centeredSlides={true}
                  navigation
                >
                  {Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() + index);
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayNumber = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

                    return (
                      <SwiperSlide key={index} style={{ width: 'auto', textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          sx={{
                            padding: '0.5rem 1rem',
                            borderRadius: 2,
                            minWidth: '60px',
                            backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                            color: isSelected ? 'primary.contrastText' : 'text.primary',
                            '&:hover': {
                              backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                          onClick={() => handleDateSelect(date)}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                            {day}
                          </Typography>
                          <Typography variant="h6" sx={{ lineHeight: 1 }}>
                            {dayNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ lineHeight: 1 }}>
                            {month}
                          </Typography>
                        </Button>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </Box>

              {/* Language Selection */}
              <Box sx={{ flex: 1, marginRight: '1rem', paddingLeft: 10 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Select Language
                </Typography>
                <Stack spacing={2}>
                  {languages.map((language, index) => (
                    <Button
                      key={index}
                      variant={selectedLanguage === language ? 'contained' : 'outlined'}
                      sx={{
                        backgroundColor: selectedLanguage === language ? 'primary.main' : 'background.paper',
                        color: selectedLanguage === language ? 'primary.contrastText' : 'text.primary',
                        borderColor: selectedLanguage === language ? 'primary.main' : 'text.secondary',

                        '&:hover': {
                          backgroundColor: selectedLanguage === language ? 'primary.dark' : 'action.hover',
                          borderColor: selectedLanguage === language ? 'primary.dark' : 'action.hover',
                        },
                      }}
                      onClick={() => setSelectedLanguage(language)}
                    >
                      {language}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Format Selection */}
              <Box sx={{ flex: 1, marginRight: '1rem' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Select Format
                </Typography>
                <Stack spacing={2}>
                  {formats.map((format, index) => (
                    <Button
                      key={index}
                      variant={selectedFormat === format ? 'contained' : 'outlined'}
                      sx={{
                        backgroundColor: selectedFormat === format ? 'primary.main' : 'background.paper',
                        color: selectedFormat === format ? 'primary.contrastText' : 'text.primary',
                        borderColor: selectedFormat === format ? 'primary.main' : 'text.secondary',

                        '&:hover': {
                          backgroundColor: selectedFormat === format ? 'primary.dark' : 'action.hover',
                          borderColor: selectedFormat === format ? 'primary.dark' : 'action.hover',
                        },
                      }}
                      onClick={() => setSelectedFormat(format)}
                    >
                      {format}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', width: '80%', marginBottom: '1rem' }}>
              {/* Theatre Selection */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Select Theatre
                </Typography>
                <Stack spacing={2}>
                  {theatres.map((theatre, index) => (
                    <Button
                      key={index}
                      variant={selectedTheatre === theatre ? 'contained' : 'outlined'}
                      sx={{
                        backgroundColor: selectedTheatre === theatre ? 'primary.main' : 'background.paper',
                        color: selectedTheatre === theatre ? 'primary.contrastText' : 'text.primary',
                        borderColor: selectedTheatre === theatre ? 'primary.main' : 'text.secondary',

                        '&:hover': {
                          backgroundColor: selectedTheatre === theatre ? 'primary.dark' : 'action.hover',
                          borderColor: selectedTheatre === theatre ? 'primary.dark' : 'action.hover',
                        },
                      }}
                      onClick={() => setSelectedTheatre(theatre)}
                    >
                      {theatre}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Showtime Selection */}
              <Box sx={{ width: '100%', flex: 1, paddingLeft: 15 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Select Showtime
                </Typography>
                <Stack direction="row" spacing={2}>
                  {showtimes.map((time, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="contained"
                      sx={{
                        padding: '1rem 2rem',
                        borderRadius: 2,
                        backgroundColor: selectedShowtime === time ? 'primary.main' : 'background.paper',
                        color: selectedShowtime === time ? 'primary.contrastText' : 'text.primary',
                        '&:hover': {
                          backgroundColor: selectedShowtime === time ? 'primary.dark' : 'action.hover',
                        },
                      }}
                      onClick={() => handleShowtimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Box>

            {/* Book Now Button */}
            <Box sx={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                disabled={!isBookingEnabled}
                loading={onRequest}
                onClick={handleBookNow}
                sx={{
                  padding: '1rem 2rem',
                  backgroundColor: isBookingEnabled ? 'primary.main' : 'grey.500',
                  '&:hover': {
                    backgroundColor: isBookingEnabled ? 'primary.dark' : 'grey.600',
                  },
                }}
              >
                Book Now
              </Button>
            </Box>
          </Box>
        </CenteredBackdrop>
      </>
    )
  );
};

export default BookingDetail;