import { Autocomplete, TextField, Typography } from '@mui/material';

const SmartAutocomplete = ({
    options = [],
    getOptionLabel = (option) => (typeof option === 'string' ? option : option.label || ''),
    filterOptions,
    inputValue,
    setInputValue,
    label = 'Search',
    placeholder = 'Type here',
    error,
    helperText,
    onEnter,
    renderOption,
    maxInputLength = 100,
    fontFamily = 'inherit',
    onSelectOption
}) => {
    return (
        <Autocomplete
            // freeSolo
            fullWidth
            size="small"
            options={options}
            getOptionLabel={getOptionLabel}
            filterOptions={
                filterOptions ??
                ((opts, state) => opts.filter((opt) => getOptionLabel(opt).toLowerCase().includes(state.inputValue.toLowerCase())))
            }
            inputValue={inputValue}
            onInputChange={(e, newInputValue) => {
                if (newInputValue.length <= maxInputLength) {
                    newInputValue = newInputValue?.split('-')?.[0]?.trim();
                    setInputValue(newInputValue);
                }
            }}
            onChange={(e, value) => {
                if (typeof value === 'object') {
                    const selected = onSelectOption?.(value);
                    if (selected !== undefined) {
                        setInputValue(selected);
                    }
                } else {
                    setInputValue(value);
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onEnter?.(inputValue);
                }
            }}
            renderOption={
                renderOption ??
                ((props, option) => {
                    const { key, ...rest } = props;
                    return (
                        <li key={key} {...rest}>
                            <Typography fontFamily={fontFamily}>{getOptionLabel(option)}</Typography>
                        </li>
                    );
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={!!error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        style: { fontFamily }
                    }}
                    InputLabelProps={{
                        style: { fontFamily }
                    }}
                />
            )}
        />
    );
};

export default SmartAutocomplete;

{
    /* <SmartAutocomplete
    options={contactList}
    getOptionLabel={(opt) => `${opt.number} - ${opt.name}`}
    filterOptions={(options, state) =>
        options.filter(
            (opt) =>
                opt.name.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                opt.number.includes(state.inputValue)
        )
    }
    inputValue={phone}
    setInputValue={(value) => setPhone(value)}
    label="Phone Number"
    placeholder="Search by number or name"
    error={error}
    helperText={error}
    onEnter={(val) => {
        const validation = validatePhone(val);
        if (validation) {
            const digits = val.replace(/\D/g, '');
            if (digits.length !== 10) {
                setError('Phone number must be 10 digits.');
            } else {
                setError('');
                handleAddPhone(digits);
                setPhone('');
            }
        }
    }}
    onSelectOption={(value) => `${value?.number}`}
    fontFamily={fontFamily}
/> */
}
