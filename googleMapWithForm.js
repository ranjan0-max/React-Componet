import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { KeyboardBackspace } from '@mui/icons-material';
import useAuth from 'hooks/useAuth';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { SiteValueContext } from 'contexts/SiteContext';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import '@mui/lab';
import {
    Typography,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Autocomplete,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Form, FormikProvider, useFormik } from 'formik';
import _ from 'lodash';
import * as Yup from 'yup';
import { gridSpacing } from 'store/constant';
import { useSnackbars } from 'Snackbars/showSnackbars';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

// APIS
import { getAllSegments } from 'api/segment/segmentApi';
import { getActiveCustomers } from 'api/customer/customerApi';

// Constant
import { ERROR, BLANK, EMAIL, MOBILE, ITEMS_TO_EXCLUDE } from 'utils/constant';

const PRODUCT_OPTIONS = ['INDUSTRIAL-EQUIPMENT', 'SPARE-PARTS', 'USED-CLOTHES'];
const PACKAGE_TYPE_OPTIONS = ['CARTON', 'BUNDLE', 'PALLET', 'LOOSE'];
const tableHeader = [
    {
        packageType: BLANK,
        noOfPackage: BLANK,
        length: BLANK,
        width: BLANK,
        height: BLANK,
        cbm: BLANK,
        cbmPrice: BLANK,
        quotation: BLANK
    }
];

const FirstMilePickUpForm = ({
    firstMilePickUpEvent,
    range,
    onCancel,
    FMPDetail,
    handleCreate,
    handleEdit,
    quotationData,
    enquiryData
}) => {
    const navigate = useNavigate();
    const snackbars = useSnackbars();
    const { user } = useAuth();
    const { siteValue } = useContext(SiteValueContext);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
        libraries: ['places']
    });

    const [center, setCenter] = useState({ lat: 25.2388854, lng: 55.3679073 });

    const handleSelect = async (googleMapAddress) => {
        const results = await getGeocode({ address: googleMapAddress });
        const { lat, lng } = getLatLng(results[0]);
        setCenter({ lat, lng });
    };

    const getInitialValues = (firstMilePickUpEvent, range) => {
        const newEvent = {
            mobile: !firstMilePickUpEvent ? FMPDetail?.mobile : quotationData?.mobileNumber || BLANK,
            email: !firstMilePickUpEvent ? FMPDetail?.email : quotationData?.customerEmail || BLANK,
            contactPerson: !firstMilePickUpEvent ? FMPDetail?.contactPerson : enquiryData?.contactPerson || BLANK,
            cod: !firstMilePickUpEvent ? FMPDetail?.cod : BLANK,
            remarks: !firstMilePickUpEvent ? FMPDetail?.remarks : BLANK,
            address: !firstMilePickUpEvent ? FMPDetail?.address : BLANK,
            // eslint-disable-next-line
            segment: !firstMilePickUpEvent ? FMPDetail?.segment : enquiryData ? enquiryData?.segment : BLANK,
            totalNoOfPackagesToCollect: !firstMilePickUpEvent ? FMPDetail?.totalNoOfPackagesToCollect : BLANK
        };

        if (firstMilePickUpEvent || range) {
            return _.merge({}, newEvent, firstMilePickUpEvent);
        }

        return newEvent;
    };

    const EventSchema = Yup.object().shape({
        mobile: Yup.string()
            .matches(/^[0-9]{8,14}$/, 'Mobile number must be 8 to 14 digits')
            .required('Mobile number is required'),
        email: Yup.string().email().required('Email is required'),
        contactPerson: Yup.string().max(255).required('Contact Person name is required'),
        cod: Yup.number().required('COD is required'),
        remarks: Yup.string().required('Remarks is required'),
        address: Yup.string().required('Address is required'),
        segment: Yup.string().required('Segment is required'),
        totalNoOfPackagesToCollect: Yup.number()
    });

    const [shipperName, setShipperName] = useState(!firstMilePickUpEvent ? FMPDetail?.shipper : null);
    const [customerName, setCustomerName] = useState(
        !firstMilePickUpEvent ? FMPDetail?.customerName : quotationData?.customerName || BLANK
    );
    const [listOfCustomerNames, setListOfCustomerNames] = useState([]);
    const [bookingMadeDate, setbookingMadeDate] = useState(!firstMilePickUpEvent ? FMPDetail?.bookingMadeDate : null);
    const [pickUpTimeFrom, setPickUpTimeFrom] = useState(!firstMilePickUpEvent ? FMPDetail?.pickUpTimeFrom : null);
    const [pickUpTimeTo, setPickUpTimeTo] = useState(!firstMilePickUpEvent ? FMPDetail?.pickUpTimeTo : null);
    const [product, setProduct] = useState(!firstMilePickUpEvent ? FMPDetail?.product : enquiryData?.cargoDescription || BLANK);
    const [googleMapAddress, setGoogleMapAddress] = useState(!firstMilePickUpEvent ? FMPDetail?.googleMapAddress : BLANK);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [allSegmentList, setAllSegmentList] = useState([]);
    // dimention table state
    const [rowIndex, setRowIndex] = useState(
        // eslint-disable-next-line
        !firstMilePickUpEvent ? FMPDetail?.dimensionDetail.length - 1 : enquiryData ? enquiryData?.dimensionDetail.length - 1 : 0
    );
    const [dimensionDetail, setDimensionDetail] = useState(
        // eslint-disable-next-line
        !firstMilePickUpEvent ? FMPDetail?.dimensionDetail : enquiryData ? enquiryData?.dimensionDetail : tableHeader
    );
    const [isChecked, setIsChecked] = useState(false);
    const [buttonPress, setButtonPress] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleChangeInDimentionTabel = () => {
        const totalUnits = dimensionDetail.reduce((accumulator, row) => accumulator + parseInt(row.noOfPackage, 10), 0);
        return totalUnits;
    };

    const formik = useFormik({
        initialValues: getInitialValues(firstMilePickUpEvent, range),
        validationSchema: EventSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const data = {
                    customerName,
                    bookingMadeDate,
                    pickUpTimeFrom,
                    pickUpTimeTo,
                    email: values.email,
                    shipper: shipperName,
                    mobile: values.mobile,
                    product,
                    segment: values.segment,
                    contactPerson: values.contactPerson,
                    cod: values.cod,
                    address: values.address,
                    googleMapAddress,
                    remarks: values.remarks,
                    enquiryNumber: enquiryData ? enquiryData.enquiry_number : null,
                    totalNoOfPackagesToCollect: isChecked ? handleChangeInDimentionTabel() : values.totalNoOfPackagesToCollect,
                    dimensionDetail: isChecked ? dimensionDetail : [],
                    userId: user.id,
                    siteId: siteValue
                };
                if (firstMilePickUpEvent) {
                    if (!buttonPress) {
                        setButtonPress(true);
                        handleCreate(data);
                    }
                } else {
                    data.id = FMPDetail._id;
                    handleEdit(data);
                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

    const handleMarkerDrag = async (e) => {
        setCenter({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${e.latLng.lat()},${e.latLng.lng()}&key=${
                    process.env.REACT_APP_GOOGLE_MAP_API_KEY
                }`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                setGoogleMapAddress(data.results[0].formatted_address);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleCustomerChange = (event, newValue) => {
        setCustomerName(newValue);
        const selectedCustomer = listOfCustomerNames.find((option) => option.customer_name === newValue);
        if (selectedCustomer) {
            formik.setFieldValue(EMAIL, selectedCustomer?.customer_email);
            formik.setFieldValue(MOBILE, selectedCustomer?.phone);
        } else {
            formik.setFieldValue(EMAIL, BLANK);
            formik.setFieldValue(MOBILE, BLANK);
        }
    };

    const fetchCustomer = async () => {
        try {
            const response = await getActiveCustomers();
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                setListOfCustomerNames(response.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSegment = async () => {
        try {
            const response = await getAllSegments();
            if (typeof response === 'string') {
                snackbars(response, ERROR);
            } else {
                const filteredSegmentList = response.filter((option) => !ITEMS_TO_EXCLUDE.includes(option.name));
                setAllSegmentList(filteredSegmentList);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSelected = (data) => {
        setGoogleMapAddress(data);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        handleSubmit();
    };

    // ================================ Handle Table Operation ====================================

    const handleAddRow = () => {
        if (dimensionDetail[dimensionDetail.length - 1].packageType) {
            if (rowIndex >= 0 && (dimensionDetail[rowIndex].packageType || dimensionDetail[rowIndex].noOfPackage)) {
                setDimensionDetail((prevDimension) => [...prevDimension, {}]);
            }
        }
    };

    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        const updatedDimensions = [...dimensionDetail];
        updatedDimensions[index] = { ...updatedDimensions[index], [name]: value };
        const currentDimension = updatedDimensions[index];
        if (name === 'noOfPackage') {
            currentDimension.length = 0;
            currentDimension.width = 0;
            currentDimension.height = 0;
            currentDimension.cbmPrice = 0;
            currentDimension.quotation = 0;
        }
        updatedDimensions[index] = { ...currentDimension };
        setRowIndex(index);
        setDimensionDetail(updatedDimensions);
    };

    const handleDeleteRow = (index) => {
        if (dimensionDetail.length === 1) {
            // Clear the input fields
            const updatedDimensions = dimensionDetail.map((row, i) => {
                if (i === index) {
                    return {
                        packageType: BLANK,
                        noOfPackage: BLANK,
                        length: BLANK,
                        width: BLANK,
                        height: BLANK,
                        cbm: BLANK,
                        cbmPrice: BLANK,
                        quotation: BLANK
                    };
                }
                return row;
            });
            setDimensionDetail(updatedDimensions);
        } else if (dimensionDetail.length > 1) {
            setDimensionDetail((prevDimensions) => prevDimensions.filter((_, i) => i !== index));
        }
    };

    // ===================================== End Table Operation ===================================

    React.useEffect(() => {
        fetchCustomer();
        fetchSegment();
    }, []);

    React.useEffect(() => {
        handleSelect(googleMapAddress);
    }, [googleMapAddress]);

    React.useEffect(() => {
        navigate('/firstMilePickup');
    }, []);

    React.useEffect(() => {
        if (!firstMilePickUpEvent) {
            if (FMPDetail?.dimensionDetail.length) {
                setIsChecked(true);
            }
        }
    }, [firstMilePickUpEvent]);

    if (!isLoaded) {
        return <div>Address Map is Loading</div>;
    }

    return (
        <MainCard>
            <FormikProvider value={formik}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form autoComplete="off" onSubmit={handleFormSubmit}>
                        <DialogTitle color="secondary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {firstMilePickUpEvent ? 'Add First Mile PickUp' : 'Edit First Mile PickUp'}
                            <Button type="button" variant="outlined" onClick={onCancel}>
                                <KeyboardBackspace color="secondary" />
                                Back
                            </Button>
                        </DialogTitle>

                        <Divider />
                        <DialogContent>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Customer Name
                                    </Typography>
                                    <Autocomplete
                                        freeSolo
                                        // disableClearable
                                        value={customerName}
                                        onChange={handleCustomerChange}
                                        options={listOfCustomerNames.map((option) => option.customer_name)}
                                        // disabled={enquiryPreview}
                                        size="small"
                                        isOptionEqualToValue={(option, value) => option === value}
                                        renderInput={(params) => (
                                            <TextField
                                                size="small"
                                                {...params}
                                                onChange={(e) => {
                                                    setCustomerName(e.target.value);
                                                }}
                                                value={customerName}
                                                placeholder="Customer Name"
                                                margin="normal"
                                                sx={{ height: '5px', marginTop: '1px' }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Customer Email
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Customer Email"
                                        type="email"
                                        {...getFieldProps('email')}
                                        error={Boolean(touched.email && errors.email)}
                                        helperText={touched.email && errors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Mobile Number
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Mobile Number"
                                        {...getFieldProps('mobile')}
                                        error={Boolean(touched.mobile && errors.mobile)}
                                        helperText={touched.mobile && errors.mobile}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                                        Date
                                    </Typography>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            value={bookingMadeDate}
                                            onChange={(date) => setbookingMadeDate(date)}
                                            renderInput={(params) => <TextField size="small" {...params} variant="outlined" fullWidth />}
                                            minDate={new Date()} // Set the maximum selectable date to the current date
                                            disablePast // Disable selecting future dates
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                                        PickUp Time
                                    </Typography>
                                    <Grid item sx={{ display: 'flex' }}>
                                        <Grid item xs={6}>
                                            <MobileTimePicker
                                                label="From"
                                                openTo="hours"
                                                size="small"
                                                value={pickUpTimeFrom}
                                                onChange={(newValue) => setPickUpTimeFrom(newValue)}
                                                renderInput={(params) => (
                                                    <TextField size="small" sx={{ marginBottom: '0' }} fullWidth {...params} />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <MobileTimePicker
                                                label="To"
                                                openTo="hours"
                                                size="small"
                                                value={pickUpTimeTo}
                                                onChange={(newValue) => setPickUpTimeTo(newValue)}
                                                renderInput={(params) => (
                                                    <TextField size="small" sx={{ marginBottom: '0' }} fullWidth {...params} />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Shipper
                                    </Typography>
                                    <Autocomplete
                                        freeSolo
                                        value={shipperName}
                                        onInputChange={(event, newInputValue) => {
                                            setShipperName(newInputValue);
                                        }}
                                        options={listOfCustomerNames.map((option) => option.customer_name)}
                                        isOptionEqualToValue={(option, value) => option === value}
                                        size="small"
                                        renderInput={(params) => (
                                            <TextField
                                                size="small"
                                                {...params}
                                                placeholder="Shipper Name"
                                                margin="normal"
                                                sx={{ height: '5px', marginTop: '1px' }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Contact Person
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Contact Person"
                                        type="text"
                                        {...getFieldProps('contactPerson')}
                                        error={Boolean(touched.contactPerson && errors.contactPerson)}
                                        helperText={touched.contactPerson && errors.contactPerson}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                                        Segment
                                    </Typography>
                                    <TextField select fullWidth size="small" {...getFieldProps('segment')}>
                                        {allSegmentList.map((option) => (
                                            <MenuItem key={option._id} value={option._id}>
                                                {option.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Product
                                    </Typography>
                                    <Autocomplete
                                        disableClearable
                                        value={product}
                                        onChange={(event, newValue) => setProduct(newValue)}
                                        options={PRODUCT_OPTIONS}
                                        size="small"
                                        isOptionEqualToValue={(option, value) => option === value}
                                        renderInput={(params) => <TextField size="small" {...params} placeholder="Product" fullWidth />}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Typography variant="h5" marginBottom="10px">
                                        COD
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="COD"
                                        {...getFieldProps('cod')}
                                        error={Boolean(touched.cod && errors.cod)}
                                        helperText={touched.cod && errors.cod}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Address
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Address"
                                        type="text"
                                        {...getFieldProps('address')}
                                        error={Boolean(touched.address && errors.address)}
                                        helperText={touched.address && errors.address}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Google Map Address
                                    </Typography>
                                    {isLoaded && <PlacesAutocomplete googleMapAddress={googleMapAddress} setSelected={handleSelected} />}
                                </Grid>

                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Map
                                    </Typography>
                                    <GoogleMap zoom={18} center={center} mapContainerStyle={{ height: '35vh' }}>
                                        <Marker
                                            position={center}
                                            // eslint-disable-next-line
                                            draggable={true}
                                            onDragEnd={handleMarkerDrag}
                                        />
                                    </GoogleMap>
                                </Grid>
                                {!isChecked && (
                                    <Grid item xs={12} sm={6} md={6}>
                                        <Typography variant="h5" marginBottom="10px">
                                            Number Of Packages
                                        </Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Address"
                                            {...getFieldProps('totalNoOfPackagesToCollect')}
                                            error={Boolean(touched.totalNoOfPackagesToCollect && errors.totalNoOfPackagesToCollect)}
                                            helperText={touched.totalNoOfPackagesToCollect && errors.totalNoOfPackagesToCollect}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isChecked}
                                                onChange={handleCheckboxChange}
                                                name="isChecked"
                                                color="primary"
                                            />
                                        }
                                        label="Check this box for enter more detail"
                                    />
                                </Grid>
                                {isChecked && (
                                    <>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" color="primary">
                                                Dimention Details
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TableContainer>
                                                <Table
                                                    style={{
                                                        border: '2px solid #2878b6',
                                                        borderRadius: '8px',
                                                        borderCollapse: 'inherit',
                                                        background: '#f8fafd'
                                                    }}
                                                >
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell style={{ borderBottom: '1px solid black' }}>Package Type</TableCell>
                                                            <TableCell style={{ borderBottom: '1px solid black' }}>No Of Package</TableCell>
                                                            <TableCell style={{ borderBottom: '1px solid black' }}>CBM</TableCell>
                                                            <TableCell style={{ borderBottom: '1px solid black' }}>
                                                                <Button onClick={handleAddRow} color="success">
                                                                    Add
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {dimensionDetail.map((row, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell style={{ borderBottom: '1px solid black' }}>
                                                                    <select
                                                                        name="packageType"
                                                                        id="packageType"
                                                                        style={{ width: '100px', height: '23px' }}
                                                                        value={row.packageType || ''}
                                                                        onChange={(e) => {
                                                                            handleInputChange(e, index);
                                                                        }}
                                                                    >
                                                                        <option value="" hidden>
                                                                            {' '}
                                                                        </option>
                                                                        <option value="BUNDLE">BUNDLE</option>
                                                                        <option value="CARTON">CARTON</option>
                                                                        <option value="ROLL">ROLL</option>
                                                                        <option value="PALLET">PALLET</option>
                                                                    </select>
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: '1px solid black' }}>
                                                                    <input
                                                                        style={{ width: '100px', height: '25px' }}
                                                                        type="number"
                                                                        name="noOfPackage"
                                                                        value={row.noOfPackage || BLANK}
                                                                        onChange={(e) => handleInputChange(e, index)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: '1px solid black' }}>
                                                                    <input
                                                                        style={{ width: '100px', height: '25px' }}
                                                                        name="cbm"
                                                                        type="number"
                                                                        value={row.cbm || BLANK}
                                                                        onChange={(e) => handleInputChange(e, index)}
                                                                    />
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: '1px solid black' }}>
                                                                    <Button color="error" onClick={() => handleDeleteRow(index)}>
                                                                        delete
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography variant="h5" marginBottom="10px">
                                        Remarks
                                    </Typography>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Remarks"
                                        type="text"
                                        {...getFieldProps('remarks')}
                                        error={Boolean(touched.remarks && errors.remarks)}
                                        helperText={touched.remarks && errors.remarks}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>

                        <DialogActions>
                            <Grid container justifyContent="center" alignItems="center">
                                <Grid item>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Button type="button" variant="outlined" color="error" onClick={onCancel}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                                            {firstMilePickUpEvent ? 'Save' : 'Update'}
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogActions>
                    </Form>
                </LocalizationProvider>
            </FormikProvider>
        </MainCard>
    );
};

export default FirstMilePickUpForm;

const PlacesAutocomplete = ({ googleMapAddress, setSelected }) => {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions
    } = usePlacesAutocomplete();

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
    };

    return (
        <Autocomplete
            // eslint-disable-next-line
            options={status === 'OK' ? data.map(({ place_id, description }) => description) : []}
            getOptionLabel={(option) => option}
            isOptionEqualToValue={(option, value) => option === value}
            value={googleMapAddress}
            disabled={!ready}
            renderInput={(params) => <TextField {...params} variant="outlined" size="small" />}
            onInputChange={(event, newInputValue) => {
                setValue(newInputValue);
                handleSelect(newInputValue);
                setSelected(newInputValue);
            }}
            inputValue={value}
        />
    );
};
