import PropTypes from 'prop-types';
import React, { useState, useContext } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useSnackbars } from 'Snackbars/showSnackbars';
import { useTheme } from '@mui/material/styles';
import { SiteValueContext } from 'contexts/SiteContext';
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    FormControlLabel,
    TextField,
    Switch,
    Typography,
    MenuItem,
    Autocomplete,
    DialogContentText,
    Dialog
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import '@mui/lab';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { KeyboardBackspace } from '@mui/icons-material';
import useAuth from 'hooks/useAuth';
// APIS
import { getAllSegments } from 'api/segment/segmentApi';
import { getActiveCustomers } from 'api/customer/customerApi';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import { gridSpacing } from 'store/constant';

// constant
import { ERROR, BLANK, MOBILE, EMAIL, OFFICE_VISIT, PHONE_CALL, WALK_IN, ITEMS_TO_EXCLUDE } from 'utils/constant';

const getInitialValues = (jobEvent, range, jobDetail) => {
    const newEvent = {};

    if (jobEvent || range) {
        return _.merge({}, newEvent, jobEvent);
    }

    return newEvent;
};

// ==============================|| COUNTRY EVENT ADD / EDIT / DELETE ||============================== //

const JobForm = ({ jobEvent, range, handleCreate, handleUpdate, onCancel, jobDetail, loadListData }) => {
    const snackbars = useSnackbars();
    const { siteValue } = useContext(SiteValueContext);
    const theme = useTheme();
    const { user } = useAuth();

    const EventSchema = Yup.object().shape({});

    const formik = useFormik({
        initialValues: getInitialValues(jobEvent, range, jobDetail),
        validationSchema: EventSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const data = {
                    userId: user.id,
                    siteId: siteValue
                };

                if (jobEvent) {
                    data.id = jobDetail.jobNumber;
                    handleUpdate(data);
                } else {
                    handleCreate(data);
                }
            } catch (error) {
                console.error(error);
            }
        }
    });

    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

    return (
        <MainCard sx={{ overflow: 'visible' }} textAlign="center">
            <FormikProvider value={formik}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Form autoComplete="off" onSubmit={formik.handleSubmit}>
                        <DialogTitle color="secondary">
                            {jobEvent ? 'Edit Job' : 'Add Job'}
                            <Button type="button" variant="outlined" sx={{ float: 'right' }} onClick={onCancel}>
                                <KeyboardBackspace color="secondary" />
                                Back
                            </Button>
                        </DialogTitle>
                        <Divider />
                        <DialogContent sx={{ p: 3 }}>
                            <Grid container spacing={gridSpacing}></Grid>
                        </DialogContent>

                        <DialogActions sx={{ p: 3 }}>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Button type="button" variant="outlined" onClick={onCancel}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                                            {jobEvent ? 'Update' : 'Save'}
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

JobForm.propTypes = {
    range: PropTypes.object,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default JobForm;
