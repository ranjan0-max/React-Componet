import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import CardContent from '@mui/material/CardContent';
import { Typography, IconButton, Box, Tooltip, Grid, Chip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import { useSnackbars } from 'Snackbars/showSnackbars';
import { getEnquiry } from 'api/sales/salesApi';
import SeeEnquiry from './ShowEnquriy';
import Flag from 'react-country-flag';
import './ContentCss.css';
import countryList from 'country-list';

const statusColors = {
    PENDING: 'info',
    APPROVED: 'success',
    REJECT: 'orange'
};
const statusLabels = {
    APPROVED: 'A',
    PENDING: 'P',
    REJECT: 'R'
    // Add other status-label mappings as needed
};

function Content({
    origin,
    destination,
    enquiryNumber,
    enquiryStatus,
    isDraggable,
    handleDeleteClick,
    sendEnquriyDetailToParent,
    sendEventToParent,
    sendBoolValueOfEnquiryFormToParent,
    customerName,
    approvalStatus,
    remark
}) {
    const originCode = countryList.getCode(origin); // Get the country code for origin
    const destinationCode = countryList.getCode(destination); // Get the country code for destination

    const snackbars = useSnackbars();
    const [{ isDraging }, drag] = useDrag(
        () => ({
            type: 'div',
            item: { enquiryNumber, enquiryStatus, isDraggable },
            canDrag: true,
            collect: (monitor) => ({
                isDraging: !!monitor.isDragging()
            })
        }),
        [isDraggable]
    );

    const divStyles = {
        backgroundColor: '#ffffff',
        margin: '10px',
        opacity: isDraging ? 0.3 : 1,
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)', // Adding a subtle box shadow
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out', // Adding smooth transition effects
        cursor: 'pointer', // Change cursor on hover
        '&:hover': {
            opacity: 0.8,
            transform: 'translateY(-3px)' // Applying a slight lift effect on hover
        }
    };

    // Add Enquriy
    const [openDrawer, setOpenDrawer] = useState(false);
    const [enquiryDetail, setEnquiryNubmer] = useState('');

    const handleDrawerOpen = () => {
        setOpenDrawer((prevState) => !prevState);
    };

    const handleDrawerClose = () => {
        setOpenDrawer((prevState) => !prevState);
    };

    const showEnquiry = async () => {
        try {
            const response = await getEnquiry(enquiryNumber);
            if (typeof response === 'string') {
                snackbars(response, 'error');
            } else {
                setEnquiryNubmer(response[0]);
                setOpenDrawer((prevState) => !prevState);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleEditClick = async () => {
        try {
            const response = await getEnquiry(enquiryNumber);
            if (typeof response === 'string') {
                snackbars(response, 'error');
            } else {
                sendEnquriyDetailToParent(response);
                sendEventToParent(true);
                sendBoolValueOfEnquiryFormToParent(true);
            }
        } catch (error) {
            console.error('Error fetching enquiry details:', error);
        }
    };
    const handleDelete = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete?');
        if (confirmDelete) {
            handleDeleteClick(enquiryNumber);
        }
    };

    return (
        <>
            <div ref={drag} style={divStyles} className="draggable-content">
                {/* <Tooltip  title={`${enquiryNumber} `}  direction="row" spacing={0.5} alignItems="center"> */}
                <CardContent style={{ padding: '15px' }} direction="row" spacing={0.5} alignItems="center">
                    {/* <Tooltip title="User Enquiry" style={{ width: '2em' }}>
                            <MenuBookTwoToneIcon color="secondary" sx={{ fontSize: '0.875rem' }} />
                        </Tooltip> */}

                    <Typography
                        onClick={showEnquiry}
                        variant="outlined"
                        underline="hover"
                        color="secondary"
                        spacing={11.5}
                        sx={{ fontSize: 13, fontWeight: 'bold', cursor: 'pointer', pt: 0.5 }}
                    >
                        #{`${enquiryNumber} `}
                        <br />
                    </Typography>

                    <Typography sx={{ fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>{`${customerName}`}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <Flag countryCode={originCode} svg style={{ fontSize: '0.9rem', marginRight: '1px' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.6rem', color: '#333', fontWeight: 'bold' }}>
                            {`${origin} -- `}
                        </Typography>
                        <Flag countryCode={destinationCode} svg style={{ fontSize: '0.9rem', marginRight: '1px', marginLeft: '5px' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.6rem', color: '#333', fontWeight: 'bold' }}>
                            {`${destination}`}
                        </Typography>
                    </div>
                    <SeeEnquiry
                        open={openDrawer}
                        handleDrawerOpen={handleDrawerOpen}
                        enquiryDetail={enquiryDetail}
                        handleDrawerClose={handleDrawerClose}
                    />
                </CardContent>
                {/* </Tooltip> */}
                <Box display="flex" flexDirection="column" alignItems="center">
                    <IconButton onClick={handleEditClick} size="small">
                        <EditIcon style={{ cursor: 'pointer', fontSize: '18px', color: '#00b400' }} />
                    </IconButton>

                    {enquiryStatus === 'PRICEREQUEST' && (
                        <Grid item component="span">
                            {`${approvalStatus}` && (
                                <Chip
                                    label={statusLabels[approvalStatus] || ''}
                                    component="span"
                                    color={statusColors[approvalStatus] || 'default'}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        '& .MuiChip-label': {
                                            px: 0.5
                                        }
                                    }}
                                />
                            )}
                        </Grid>
                    )}
                    {/* <IconButton onClick={handleDelete}>
                       <DeleteIcon size="small" style={{ cursor: 'pointer', fontSize: '18px', color: '#b43600' }} />
                   </IconButton> */}
                </Box>
            </div>
        </>
    );
}

export default Content;
