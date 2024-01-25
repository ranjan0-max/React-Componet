import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Box, Button, Drawer, Grid, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import React from 'react';
// ==============================|| enquiry drawer||============================== //

function SeeEnquiry({ open, handleDrawerOpen, enquiryDetail, handleDrawerClose }) {
    const navigate = useNavigate();
    const handleSendQuotation = () => {
        navigate(`/sales/quotation?enquiryNumber=${enquiryDetail?.enquiry_number}&open=true`);
    };

    return (
        <Drawer
            sx={{
                ml: open ? 3 : 0,
                flexShrink: 0,
                zIndex: 1200,
                overflowX: 'hidden',
                width: { xs: 350, md: 500 },
                '& .MuiDrawer-paper': {
                    height: '100vh',
                    width: { xs: 350, md: 500 },
                    position: 'fixed',
                    border: 'none',
                    borderRadius: '0px'
                }
            }}
            variant="temporary"
            anchor="right"
            open={open}
            ModalProps={{ keepMounted: true }}
            onClose={handleDrawerOpen}
        >
            {open && (
                <Box sx={{ p: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h2" color="secondary" style={{ wordSpacing: '1px', letterSpacing: '1px' }}>
                                    Enquiry Detail
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography
                                    variant="h5"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'auto auto',
                                        gap: '15px',
                                        columnGap: '15px',
                                        wordSpacing: '2px'
                                    }}
                                >
                                    <Typography variant="h4" component="span">
                                        <strong>Enquiry Number :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.enquiry_number}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Customer Name :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.customer_name}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Mobile Number :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.mobile}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Email :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.email}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Origin :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.origin}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Destination :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.destination}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Number Pkg :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.number_pkg || enquiryDetail.units}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Total Weight :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.total_weight} kg
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>CBM :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.cbm}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Budget :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.budget}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Quotation :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.quotation}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Remark :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {enquiryDetail.remark}
                                    </Typography>
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant="contained" onClick={handleDrawerClose}>
                                    CLOSE
                                </Button>
                            </Grid>
                            {enquiryDetail.enquiry_status === 'approval' && (
                                <Grid item xs={6}>
                                    <Button fullWidth variant="contained" onClick={handleSendQuotation}>
                                        Send Quotation
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </LocalizationProvider>
                </Box>
            )}
        </Drawer>
    );
}

SeeEnquiry.propTypes = {
    open: PropTypes.bool,
    handleDrawerOpen: PropTypes.func
};

export default SeeEnquiry;
