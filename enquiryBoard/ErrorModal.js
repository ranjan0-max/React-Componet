import PropTypes from 'prop-types';
import { useState } from 'react';

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
    Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import '@mui/lab';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

const ErrorModal = ({ onClose, approvalManagerError, priceApprovalAccessError, quotationError, bookingAccessError }) => (
    <MainCard>
        <Grid container justify="center" alignItems="center">
            <Grid item xs={12} textAlign="center">
                <Typography variant="h4">{approvalManagerError ? 'Price Approval Manager Not Assign' : ''}</Typography>
                <Typography variant="h4">{priceApprovalAccessError ? 'Budget Not Approved' : ''}</Typography>
                <Typography variant="h4">{quotationError ? 'Quotation Not Approved' : ''}</Typography>
                <Typography variant="h4">{bookingAccessError ? "You don't have access to this route" : ''}</Typography>
            </Grid>
            <Grid item xs={12} textAlign="center" marginTop="10px">
                <Button onClick={onClose}>OK</Button>
            </Grid>
        </Grid>
    </MainCard>
);

export default ErrorModal;
