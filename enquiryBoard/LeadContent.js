import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import CardContent from '@mui/material/CardContent';
import { Typography, IconButton, Box, Tooltip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useSnackbars } from 'Snackbars/showSnackbars';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { getLeadById } from 'api/lead/leadApi';
import './ContentCss.css';
import LeadDrawer from './LeadDrawer';

function LeadContent({ leadNumber, handleDeleteClick, customerName, industry, volume, sendLeadDetailToParent }) {
    const divStyles = {
        backgroundColor: '#ffffff',
        margin: '10px',
        // opacity: isDraging ? 0.3 : 1,
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };
    const [{ isDraging }, drag] = useDrag(
        () => ({
            type: 'div',
            item: { leadNumber, name: 'lead' },
            canDrag: true,
            collect: (monitor) => ({
                isDraging: !!monitor.isDragging()
            })
        })
        // ,[isDraggable]
    );

    const snackbars = useSnackbars();
    const [openDrawer, setOpenDrawer] = useState(false);
    const [leadDetail, setLeadDetail] = useState([]);

    const fetchLead = async () => {
        try {
            const response = await getLeadById(leadNumber);
            if (typeof response === 'string') {
                snackbars(response, 'error');
            } else {
                setLeadDetail(response);
                setOpenDrawer(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDrawerOpen = () => {
        setOpenDrawer(true);
    };

    const handleDrawerClose = () => {
        setOpenDrawer(false);
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete?');
        if (confirmDelete) {
            handleDeleteClick(leadNumber);
        }
    };

    return (
        <>
            <div ref={drag} style={divStyles}>
                <CardContent style={{ padding: '15px' }} direction="row" spacing={0.5} alignItems="center">
                    <Typography
                        onClick={fetchLead}
                        variant="outlined"
                        underline="hover"
                        color="secondary"
                        spacing={11.5}
                        sx={{ fontSize: 13, fontWeight: 'bold', cursor: 'pointer', pt: 0.5 }}
                    >
                        #{`${leadNumber} `}
                        <br />
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>{`${customerName}`}</Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon color="primary" sx={{ fontSize: '1rem', marginRight: '5px' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#333', fontWeight: 'bold' }}>
                            {industry}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <WidgetsIcon color="primary" sx={{ fontSize: '1rem', marginRight: '5px' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#333', fontWeight: 'bold' }}>
                            {volume}
                        </Typography>
                    </div>
                    <LeadDrawer
                        open={openDrawer}
                        handleDrawerOpen={handleDrawerOpen}
                        leadDetail={leadDetail}
                        handleDrawerClose={handleDrawerClose}
                    />
                </CardContent>
            </div>
        </>
    );
}

export default LeadContent;
