import { useState, useContext } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AccessableUrlsContext } from 'contexts/accessableRouteContext';
import '@mui/lab';

// project imports
import MainCard from 'ui-component/cards/MainCard';

const OptionSelectorModel = ({ onClose, enquiryNumber }) => {
    const navigate = useNavigate();
    const { accessableUrls } = useContext(AccessableUrlsContext);
    const [showError, setShowError] = useState(false);

    const handleFmlButton = () => {
        if (accessableUrls.includes('/firstMilePickup')) {
            navigate(`/firstMilePickup?enquiryNumber=${enquiryNumber}&open=true`);
        } else {
            setShowError(true);
        }
    };

    const handleBookingButton = () => {
        if (accessableUrls.includes('/booking')) {
            navigate(`/booking?enquiryNumber=${enquiryNumber}&open=true`);
        } else {
            setShowError(true);
        }
    };

    return (
        <MainCard>
            <Grid container justify="center" alignItems="center">
                {showError ? (
                    <Grid item xs={12} textAlign="center">
                        <Typography variant="h4">You don&apos;t have access to this route</Typography>
                    </Grid>
                ) : (
                    <Grid item xs={12} textAlign="center" marginTop="10px">
                        <Button onClick={handleBookingButton}>Booking</Button>
                        <Button onClick={handleFmlButton}>FML</Button>
                    </Grid>
                )}

                <Grid item xs={12} textAlign="center" marginTop="10px">
                    <Button onClick={onClose}>Close</Button>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default OptionSelectorModel;
