import React, { useState, useContext } from 'react';
import Content from './Content';
import { useDrop } from 'react-dnd';
import Typography from '@mui/material/Typography';
import { useSnackbars } from 'Snackbars/showSnackbars';
import EnquiryForm from '../enquiry/EnquiryForm';
import useAuth from 'hooks/useAuth';
import { getAllEnquiry, updateEnquiry, deleteEnquiry, addEnquiry } from 'api/sales/salesApi';
import { getAllSegments } from 'api/segment/segmentApi';
import { getActiveUsersBySite, getSalesManBySaleManager } from 'api/user/userApi';
import ErrorModal from './ErrorModal';
import OptionSelectorModel from './optionSelectorModel';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/AddTwoTone';
// material-ui
import { Divider, Dialog, Button, Stack, MenuItem, TextField } from '@mui/material';
import { getLeads } from 'api/lead/leadApi';
import LeadContent from './LeadContent';
import MainCard from 'ui-component/cards/MainCard';
import { SiteValueContext } from 'contexts/SiteContext';
import { AccessableUrlsContext } from 'contexts/accessableRouteContext';

// ----------------------------Constant--------------------------------------

import { SUPER_ADMIN, SITE_ADMIN, ERROR, SALE_MANAGER, SALEMAN, SUCCESS } from 'utils/constant';

const ALL_SEGMENT = 'ALL SEGMENT';
const ENQUIRY = 'ENQUIRY';
const APPROVED = 'APPROVED';
const QUOTATION = 'QUOTATION';
const QUOTEWON = 'QUOTEWON';
const QUOTELOST = 'QUOTELOST';
const BOOKED = 'BOOKED';
const LEAD = 'lead';
const PRICEREQUEST = 'PRICEREQUEST';
const ALL = 'all';

// --------------------------- End Constant ------------------------------

function DragAndDrop() {
    const { user } = useAuth();
    const { siteValue } = useContext(SiteValueContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { accessableUrls } = useContext(AccessableUrlsContext);

    const [search, setSearch] = React.useState('');
    const [lead, setLead] = useState([]);
    const [leadListOnBoard, setLeadListOnBorad] = useState([]);
    const [enquiry, setEnquiry] = useState([]);
    // const [priceRequest, setPriceRequest] = useState([]);
    const [approvalManagerError, setApprovalManagerError] = useState(false);
    const [approval, setApproval] = useState([]);
    const [quoteWon, setQuoteWon] = useState([]);
    const [quotation, setQuotation] = useState([]);
    const [quoteLost, setQuoteLost] = useState([]);
    const [booked, setBooked] = useState([]);
    const [showEnquiryForm, setEnquiryForm] = useState();
    const [enquiryDetailFromChild, setEnquiryDetailFromChild] = useState({});
    const [eventFromChild, setEventFromChild] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOptionSelectorModelOpen, setIsOptionSelectorModelOpen] = useState(false);
    const [priceApprovalAccessError, setPriceApprovalAccessError] = useState(false);
    const [quotationError, setQuotationError] = useState(false);
    const [bookingAccessError, setBookingAccessError] = useState(false);
    const [optionSelectorEnquiryNumber, setOptionSelectorEnquiryNumber] = useState('');
    const [allEnquiry, setAllEnquiry] = useState([]);
    const [salesManFilter, setSalesManFilter] = useState('');
    const [salesManagerFilter, setSalesManagerFilter] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('');
    const [allSegmentList, setAllSegmentList] = useState([]);
    const [filterEnquiry, setFilterEnquiry] = useState([]);
    const [listOfSalesManager, setListOfManager] = useState([]);
    const [listOfSalesMan, setListOfSalesMan] = useState([]);
    const [listOfSalesManBySaleManger, setListOfSalesManBySaleManager] = useState([]);
    const [listOfSegmentByManager, setListOfSegmentByManager] = useState([]);
    const [idOfAllSegmentOption, setIdOfAllSegmentOption] = useState('');
    const snackbars = useSnackbars();

    const dataFillerInBoard = (enquiries) => {
        const categorizedData = enquiries.reduce((acc, obj) => {
            const status = obj?.enquiry_status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(obj);
            return acc;
        }, {});

        const { ENQUIRY, PRICEREQUEST, APPROVED, QUOTATION, QUOTEWON, QUOTELOST, BOOKED } = categorizedData;

        setEnquiry([...(ENQUIRY || []), ...(PRICEREQUEST || [])]);
        // setPriceRequest(PRICEREQUEST || []);
        setApproval(APPROVED || []);
        setQuotation(QUOTATION || []);
        setQuoteWon(QUOTEWON || []);
        setQuoteLost(QUOTELOST || []);
        setBooked(BOOKED || []);
    };

    const getAllLeads = async () => {
        const response = await getLeads(user, siteValue);
        if (typeof response === 'string') {
            snackbars(response, ERROR);
        } else {
            setLead(response.data.data);
            setLeadListOnBorad(response.data.data);
        }
    };

    const fetchSegment = async () => {
        try {
            const response = await getAllSegments();
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                const allSegmentOption = response.filter((segment) => segment.name === ALL_SEGMENT);
                setIdOfAllSegmentOption(allSegmentOption[0]._id);
                setAllSegmentList(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSaleManager = async () => {
        try {
            const response = await getActiveUsersBySite(siteValue, SALE_MANAGER);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setListOfManager(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSalesMan = async () => {
        try {
            const response = await getActiveUsersBySite(siteValue, SALEMAN);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setListOfSalesMan(response);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSalesManBySalesManager = async (saleManagerId) => {
        try {
            const response = await getSalesManBySaleManager(saleManagerId);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                if (response.length) {
                    setListOfSalesManBySaleManager(response);
                    return;
                }
                setListOfSalesManBySaleManager([]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const filterSegmentByManager = async () => {
        try {
            const response = await getSalesManBySaleManager(salesManagerFilter);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                // eslint-disable-next-line
                if (response.length) {
                    const segmentByManager = new Set();

                    response.forEach((obj) => {
                        obj.segment.forEach((segment) => {
                            segmentByManager.add(segment);
                        });
                    });

                    const filteredSegments = allSegmentList.filter((segment) => segmentByManager.has(segment._id));

                    setListOfSegmentByManager(filteredSegments);
                } else {
                    setListOfSegmentByManager([]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getAllEnquiryToBoard = async () => {
        const response = await getAllEnquiry(user, siteValue);
        setAllEnquiry(response);
        if (typeof response === 'string') {
            snackbars(response, ERROR);
        } else {
            dataFillerInBoard(response);
        }
    };

    const onCancel = () => {
        setEnquiryForm(false);
        getAllEnquiryToBoard();
    };

    const onClose = () => {
        setIsModalOpen(false);
    };

    const closeOptionSelectorModel = () => {
        setIsOptionSelectorModelOpen(false);
    };

    const addEnquiryToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: ENQUIRY });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    // ------------------------------ function of price request ------------------------ //

    // const addPriceRequestToBoard = async (enquiryNumber) => {
    //     try {
    //         const response = await updateEnquiry(enquiryNumber, { enquiry_status: 'PRICEREQUEST' });
    //         if (typeof response === 'string') {
    //             snackbars(response, 'error');
    //         } else {
    //             snackbars(response.data.message, 'success');
    //             getAllEnquiryToBoard();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    const addApprovalToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: APPROVED });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const addQuotationToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: QUOTATION });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const addQuoteWonToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: QUOTEWON });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const addQuoteLostToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: QUOTELOST });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const addBookedToBoard = async (enquiryNumber) => {
        try {
            const response = await updateEnquiry(enquiryNumber, { enquiry_status: BOOKED });
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const [{ enquiryOver }, enquiryDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: (item) => {
            if (item.name === LEAD) {
                navigate(`/sales/enquiry?leadNumber=${item.leadNumber}&open=true`);
            }
        },
        drop: (item) => addEnquiryToBoard(item.enquiryNumber),
        collect: (monitor) => ({
            enquiryOver: !!monitor.isOver()
        })
    }));

    // ------------------------- price request drop -------------------------//

    // const [{ priceRequestOver }, priceRequestDrop] = useDrop(() => ({
    //     accept: 'div',
    //     canDrop: (item) => {
    //         if (item.enquiryStatus === 'ENQUIRY') {
    //             if (!item.isDraggable) {
    //                 setApprovalManagerError(true);
    //                 setIsModalOpen(true);
    //             }
    //         }
    //         return item.enquiryStatus === 'ENQUIRY';
    //     },
    //     drop: (item) => {
    //         if (item.isDraggable) {
    //             addPriceRequestToBoard(item.enquiryNumber);
    //         }
    //     },
    //     collect: (monitor) => ({
    //         priceRequestOver: !!monitor.isOver()
    //     })
    // }));

    const [{ approvalOver }, approvalDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: async (item) => {
            if (item.enquiryStatus === PRICEREQUEST) {
                if (!item.isDraggable) {
                    if (accessableUrls.includes('/approval/enquiry-price')) {
                        navigate('/approval/enquiry-price');
                    } else {
                        setPriceApprovalAccessError(true);
                        setIsModalOpen(true);
                    }
                }
            } else if (item.enquiryStatus === ENQUIRY) {
                setApprovalManagerError(true);
                setIsModalOpen(true);
            }
            return item.enquiryStatus === PRICEREQUEST;
        },
        drop: (item) => {
            if (item.isDraggable) {
                addApprovalToBoard(item.enquiryNumber);
            }
        },
        collect: (monitor) => ({
            approvalOver: !!monitor.isOver()
        })
    }));

    const [{ quotationOver }, quotationDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: (item) => {
            if (item.enquiryStatus === APPROVED) {
                if (!item.isDraggable) {
                    navigate(`/sales/quotation?enquiryNumber=${item.enquiryNumber}&open=true`);
                }
            }
            return item.enquiryStatus === APPROVED;
        },
        drop: (item) => {
            if (item.isDraggable) {
                addQuotationToBoard(item.enquiryNumber);
            }
        },
        collect: (monitor) => ({
            quotationOver: !!monitor.isOver()
        })
    }));

    const [{ quoteWonOver }, quoteWonDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: (item) => {
            if (item.enquiryStatus === QUOTATION) {
                if (!item.isDraggable) {
                    setQuotationError(true);
                    setIsModalOpen(true);
                }
            }
            return item.enquiryStatus === QUOTATION;
        },
        drop: (item) => addQuoteWonToBoard(item.enquiryNumber),
        collect: (monitor) => ({
            quoteWonOver: !!monitor.isOver()
        })
    }));

    const [{ quoteLostOver }, quoteLostDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: (item) => item.enquiryStatus === QUOTATION,
        drop: (item) => addQuoteLostToBoard(item.enquiryNumber),
        collect: (monitor) => ({
            quoteLostOver: !!monitor.isOver()
        })
    }));

    const [{ bookedOver }, bookedDrop] = useDrop(() => ({
        accept: 'div',
        canDrop: (item) => {
            if (item.enquiryStatus === QUOTEWON) {
                if (!item.isDraggable) {
                    setOptionSelectorEnquiryNumber(item.enquiryNumber);
                    setIsOptionSelectorModelOpen(true);
                }
            }
            return item.enquiryStatus === QUOTEWON;
        },
        drop: (item) => {
            if (item.isDraggable) {
                addBookedToBoard(item.enquiryNumber);
            }
        },
        collect: (monitor) => ({
            bookedOver: !!monitor.isOver()
        })
    }));

    const handleEventUpdate = async (data) => {
        const id = data.enquiry_number;
        delete data.enquiry_number;
        try {
            const response = await updateEnquiry(id, data);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                onCancel();
                getAllEnquiryToBoard();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleEventCreate = async (data) => {
        try {
            const response = await addEnquiry(data);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
                onCancel();
                getAllEnquiryToBoard();
                getAllLeads();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteClick = async (deleteEnquiryNumber) => {
        try {
            const response = await deleteEnquiry(deleteEnquiryNumber);
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                snackbars(response.data.message, SUCCESS);
            }
        } catch (error) {
            console.log(error);
        }
        getAllEnquiryToBoard();
    };

    const handleFilter = (e) => {
        const newString = e.target.value;
        setSearch(newString || '');

        if (newString) {
            const newRows = filterEnquiry.filter((row) => {
                let matches = true;

                const properties = ['enquiry_number', 'customer_name', 'email', 'mobile', 'origin', 'destination', 'mode'];
                let containsQuery = false;

                properties.forEach((property) => {
                    if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
                        containsQuery = true;
                    }
                });

                if (!containsQuery) {
                    matches = false;
                }
                return matches;
            });
            dataFillerInBoard(newRows);
        } else {
            dataFillerInBoard(filterEnquiry);
        }
    };

    const handleSalesManFilter = (e) => {
        setSalesManFilter(e.target.value);
    };

    const handleSegmentFilter = (e) => {
        setSegmentFilter(e.target.value);
    };

    const handleSalesManagerFilter = (e) => {
        setSalesManagerFilter(e.target.value);
    };

    const filterSegmentBySalesMan = (salesManId, listOfSalesManBySaleManger) => {
        if (listOfSalesManBySaleManger.length) {
            const segmentMapped = listOfSalesManBySaleManger.find((mappList) => mappList.salesMan[0]._id === salesManId);
            if (segmentMapped) {
                const filteredSegments = allSegmentList.filter((segment) => segmentMapped.segment.includes(segment._id));
                setListOfSegmentByManager(filteredSegments);
            }
        }
    };

    const handleExtraFilter = () => {
        let filteredEnquiries = [...allEnquiry];
        let filteredLead = [...lead];

        if (segmentFilter !== idOfAllSegmentOption && segmentFilter) {
            filteredEnquiries = filteredEnquiries.filter((enquiry) => enquiry.segment === segmentFilter);
            filteredLead = filteredLead.filter((lead) => lead.segment === segmentFilter);
        }

        if (salesManFilter) {
            filteredEnquiries = filteredEnquiries.filter((enquiry) => enquiry.userId === salesManFilter);
            filteredLead = filteredLead.filter((lead) => lead.userId === salesManFilter);
        }

        if (salesManagerFilter) {
            const combinedEnquiries = [];
            const combinedLeads = [];

            if (listOfSegmentByManager.length) {
                const segmentArray = [];
                let foundAllSegment = false;
                listOfSegmentByManager.forEach((segment) => {
                    if (segment._id === idOfAllSegmentOption) {
                        foundAllSegment = true;
                    } else {
                        segmentArray.push(segment._id);
                    }
                });

                if (foundAllSegment) {
                    const uniqueEnquiryNumbers = new Set();

                    listOfSalesManBySaleManger.forEach((mappedList) => {
                        const filterFunction = mappedList.segment.includes(idOfAllSegmentOption)
                            ? (enquiry) => mappedList.salesMan[0]._id === enquiry.userId
                            : (enquiry) => segmentArray.includes(enquiry.segment);

                        const filteredEnquiries = allEnquiry.filter(filterFunction);

                        filteredEnquiries.forEach((enquiry) => {
                            if (!uniqueEnquiryNumbers.has(enquiry.enquiry_number)) {
                                uniqueEnquiryNumbers.add(enquiry.enquiry_number);
                                combinedEnquiries.push(enquiry);
                            }
                        });

                        const filteredleadAllSegment = lead.filter(filterFunction);

                        filteredleadAllSegment.forEach((lead) => {
                            if (!uniqueEnquiryNumbers.has(lead.leadNumber)) {
                                uniqueEnquiryNumbers.add(lead.leadNumber);
                                combinedLeads.push(lead);
                            }
                        });
                    });

                    filteredEnquiries = combinedEnquiries;
                    filteredLead = combinedLeads;
                } else {
                    filteredEnquiries = filteredEnquiries.filter((enquiry) => segmentArray.includes(enquiry.segment));
                    filteredLead = filteredLead.filter((lead) => segmentArray.includes(lead.segment));
                }
            } else {
                filteredEnquiries = [];
                filteredLead = [];
            }
        }
        setLeadListOnBorad(filteredLead);
        setFilterEnquiry(filteredEnquiries);
        dataFillerInBoard(filteredEnquiries);
    };

    const handleEnquiryDetailFromParent = (data) => {
        setEnquiryDetailFromChild(data);
    };

    const handleEventFromParent = (data) => {
        setEventFromChild(data);
    };

    const handleBoolValueOfEnquiryForm = (data) => {
        setEnquiryForm(data);
    };

    const handleAddClick = () => {
        setEventFromChild(false);
        setEnquiryForm(true);
    };

    React.useEffect(() => {
        if (salesManFilter === ALL) {
            setFilterEnquiry(allEnquiry);
        } else if (salesManFilter && salesManFilter) {
            setSegmentFilter('');
            filterSegmentBySalesMan(salesManFilter, listOfSalesManBySaleManger);
        } else if (salesManagerFilter && !salesManFilter) {
            setSegmentFilter('');
            filterSegmentByManager();
        } else {
            setSegmentFilter('');
        }
    }, [salesManFilter, allEnquiry]);

    React.useEffect(() => {
        getAllEnquiryToBoard();
        getAllLeads();
        if (user.role[0].role === SUPER_ADMIN || user.role[0].role === SITE_ADMIN) {
            fetchSegment();
            fetchSaleManager();
            fetchSalesMan();
        }
        if (user.role[0].role === SALE_MANAGER) {
            fetchSalesManBySalesManager(user.id);
        }
    }, []);

    React.useEffect(() => {
        getAllEnquiryToBoard();
        getAllLeads();
        if (user.role[0].role === SUPER_ADMIN || user.role[0].role === SITE_ADMIN) {
            fetchSaleManager();
            fetchSalesMan();
        }
    }, [siteValue]);

    React.useEffect(() => {
        if (location.pathname === '/sales/enquiryBoard') {
            setEnquiryForm(false);
        }
    }, [location]);

    React.useEffect(() => {
        if (salesManagerFilter) {
            setSalesManFilter('');
            setSegmentFilter('');
            fetchSalesManBySalesManager(salesManagerFilter);
            filterSegmentByManager();
        } else {
            setSalesManFilter('');
            setSegmentFilter('');
            setSalesManagerFilter('');
            dataFillerInBoard(allEnquiry);
            setListOfSalesManBySaleManager([]);
            setListOfSegmentByManager([]);
        }
    }, [salesManagerFilter]);

    React.useEffect(() => {
        handleExtraFilter();
    }, [segmentFilter, salesManFilter, salesManagerFilter, listOfSegmentByManager]);

    React.useEffect(() => {
        setFilterEnquiry(allEnquiry);
    }, [allEnquiry]);

    return showEnquiryForm ? (
        <EnquiryForm
            onCancel={onCancel}
            handleUpdate={handleEventUpdate}
            handleEventCreate={handleEventCreate}
            enquiryEvent={eventFromChild}
            editEnquiryDetail={enquiryDetailFromChild}
        />
    ) : (
        <MainCard
            title={
                <Typography variant="h3" color="secondary">
                    Enquriy Board
                </Typography>
            }
            secondary={
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField label="Filter" sx={{ minWidth: '100px' }} size="small" onChange={handleFilter} value={search} />
                    {user.role[0].role === SUPER_ADMIN || user.role[0].role === SITE_ADMIN ? (
                        <TextField
                            select
                            label="Sales Manager"
                            sx={{ minWidth: '150px' }}
                            size="small"
                            onChange={handleSalesManagerFilter}
                            value={salesManagerFilter}
                        >
                            <MenuItem value="">EMPTY</MenuItem>
                            {listOfSalesManager.map((option) => (
                                <MenuItem key={option._id} value={option._id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        ''
                    )}
                    {user.role[0].role === SUPER_ADMIN || user.role[0].role === SITE_ADMIN || user.role[0].role === SALE_MANAGER ? (
                        <TextField
                            select
                            label="Sales Man"
                            sx={{ minWidth: '120px' }}
                            size="small"
                            onChange={handleSalesManFilter}
                            value={salesManFilter}
                        >
                            <MenuItem value="">EMPTY</MenuItem>
                            {salesManagerFilter || user.role[0].role === SALE_MANAGER
                                ? listOfSalesManBySaleManger.map((option) => (
                                      <MenuItem key={option.salesMan[0]._id} value={option.salesMan[0]._id}>
                                          {option.salesMan[0].name}
                                      </MenuItem>
                                  ))
                                : listOfSalesMan.map((option) => (
                                      <MenuItem key={option._id} value={option._id}>
                                          {option.name}
                                      </MenuItem>
                                  ))}
                        </TextField>
                    ) : (
                        ''
                    )}
                    {user.role[0].role === SUPER_ADMIN || user.role[0].role === SITE_ADMIN ? (
                        <TextField
                            select
                            label="Segment"
                            sx={{ minWidth: '120px' }}
                            size="small"
                            onChange={handleSegmentFilter}
                            value={segmentFilter}
                        >
                            <MenuItem value="">EMPTY</MenuItem>
                            {(!salesManagerFilter && salesManFilter) || (!salesManagerFilter && !salesManFilter)
                                ? allSegmentList.map((option) => (
                                      <MenuItem key={option._id} value={option._id}>
                                          {option.name}
                                      </MenuItem>
                                  ))
                                : listOfSegmentByManager.map((option) => (
                                      <MenuItem key={option._id} value={option._id}>
                                          {option.name}
                                      </MenuItem>
                                  ))}
                        </TextField>
                    ) : (
                        ''
                    )}
                    <Button color="secondary" variant="contained" onClick={handleAddClick}>
                        <AddIcon fontSize="small" /> Add Enquiry
                    </Button>
                </Stack>
            }
        >
            <div style={{ display: 'flex', overflowX: 'auto' }}>
                <div style={{ display: 'flex' }}>
                    <div
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography variant="h3" sx={{ fontSize: 16, color: 'black', fontWeight: 'bold' }} color="textSecondary">
                                Lead <span style={{ marginLeft: '10px' }}> {lead.length}</span>
                            </Typography>
                        </div>

                        <Divider />
                        <Divider />
                        {leadListOnBoard.map((content) => (
                            <LeadContent
                                leadNumber={content.leadNumber}
                                customerName={content.name}
                                industry={content.industry}
                                volume={content.volumeMode}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.leadNumber}
                            />
                        ))}
                    </div>
                    <div
                        ref={enquiryDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Enquiry
                                <span style={{ marginLeft: '10px' }}> {enquiry.length}</span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {enquiry.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={content.priceApprove}
                                approvalStatus={content.approvalStatus ? content.approvalStatus : ' '}
                            />
                        ))}
                    </div>
                    {/* <div
                        ref={priceRequestDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Price Request
                                <span style={{ marginLeft: '10px' }}> {priceRequest.length} </span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {priceRequest.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={content.priceApprove}
                                approvalStatus={content.approvalStatus ? content.approvalStatus : ' '}
                                remarks={content.remark ? content.remark : ''}
                            />
                        ))}
                    </div> */}
                    <div
                        ref={approvalDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Approved
                                <span style={{ marginLeft: '10px' }}> {approval.length}</span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {approval.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={content.quotationMade}
                                // approvalStatus={content.approvalStatus ? content.approvalStatus : ' '}
                                remarks={content.remark ? content.remark : ''}
                            />
                        ))}
                    </div>
                    <div
                        ref={quotationDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Quotation
                                <span style={{ marginLeft: '10px' }}> {quotation.length}</span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {quotation.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={content.quotationApprove}
                                // approvalStatus={content.approvalStatus ? content.approvalStatus : ' '}
                            />
                        ))}
                    </div>
                    <div
                        ref={quoteWonDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Quote Won
                                <span style={{ marginLeft: '10px' }}> {quoteWon.length} </span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {quoteWon.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={content.bookingMade}
                            />
                        ))}
                    </div>
                    <div
                        ref={quoteLostDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Quote Lost
                                <span style={{ marginLeft: '10px' }}> {quoteLost.length} </span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {quoteLost.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable
                            />
                        ))}
                    </div>
                    <div
                        ref={bookedDrop}
                        style={{
                            backgroundColor: '#e3e8e8',
                            marginRight: '20px',
                            minWidth: '250px',
                            overflow: 'auto',
                            textAlign: 'center',
                            margin: '0px 16px 0px 0px',
                            padding: '8px 16px 14pxm',
                            width: 'auto',
                            borderRadius: '4px',
                            height: '100vh',
                            border: '1px solid rgb(133 145 161 / 46%)'
                        }}
                    >
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <Typography
                                variant="h3"
                                sx={{ fontSize: 16, color: 'black', fontWeight: 'bold', marginTop: '5px' }}
                                color="textSecondary"
                            >
                                Booked
                                <span style={{ marginLeft: '10px' }}> {booked.length} </span>
                            </Typography>
                        </div>
                        <Divider />
                        <Divider />
                        {booked.map((content) => (
                            <Content
                                enquiryNumber={content.enquiry_number}
                                origin={content.origin}
                                destination={content.destination}
                                customerName={content.customer_name}
                                description={content.description}
                                enquiryStatus={content.enquiry_status}
                                handleEventUpdate={handleEventUpdate}
                                handleDeleteClick={handleDeleteClick}
                                key={content.enquiry_number}
                                sendEnquriyDetailToParent={handleEnquiryDetailFromParent}
                                sendEventToParent={handleEventFromParent}
                                sendBoolValueOfEnquiryFormToParent={handleBoolValueOfEnquiryForm}
                                isDraggable={false}
                            />
                        ))}
                    </div>
                    <Dialog maxWidth="xs" fullWidth onClose={onClose} open={isModalOpen} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
                        {isModalOpen && (
                            <ErrorModal
                                onClose={onClose}
                                approvalManagerError={approvalManagerError}
                                priceApprovalAccessError={priceApprovalAccessError}
                                quotationError={quotationError}
                                bookingAccessError={bookingAccessError}
                            />
                        )}
                    </Dialog>
                    <Dialog
                        maxWidth="xs"
                        onClose={closeOptionSelectorModel}
                        open={isOptionSelectorModelOpen}
                        sx={{ '& .MuiDialog-paper': { p: 0 } }}
                    >
                        {isOptionSelectorModelOpen && (
                            <OptionSelectorModel onClose={closeOptionSelectorModel} enquiryNumber={optionSelectorEnquiryNumber} />
                        )}
                    </Dialog>
                </div>
            </div>
        </MainCard>
    );
}

export default DragAndDrop;
