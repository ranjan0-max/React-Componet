import PropTypes from 'prop-types';

// material-ui
import { Box, Button, Drawer, Grid, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import React from 'react';

// ==============================|| Lead Drawer ||============================== //

function LeadDrawer({ open, handleDrawerOpen, leadDetail, handleDrawerClose }) {
    return (
        <Drawer
            sx={{
                ml: open ? 3 : 0,
                flexShrink: 0,
                zIndex: 1200,
                overflowX: 'hidden',
                width: { xs: 350, md: 450 },
                '& .MuiDrawer-paper': {
                    height: '100vh',
                    width: { xs: 350, md: 450 },
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
                                    Lead Detail
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
                                        <strong>Lead Number :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.leadNumber}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Customer Name :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.name}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Mobile Number :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.mobile}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Email :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.email}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Contact Person :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.contactPerson}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Industry :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.industry}
                                    </Typography>
                                    <Typography variant="h4" component="span">
                                        <strong>Volume Mode :</strong>
                                    </Typography>
                                    <Typography variant="h5" component="span">
                                        {leadDetail[0]?.volumeMode}
                                    </Typography>
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth variant="contained" onClick={handleDrawerClose}>
                                    CLOSE
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Box>
            )}
        </Drawer>
    );
}

LeadDrawer.propTypes = {
    open: PropTypes.bool,
    handleDrawerOpen: PropTypes.func
};

export default LeadDrawer;
