import React, { useState } from 'react';
import { TableCell, FormControl, Select, MenuItem, Box, Chip } from '@mui/material';
import { CATEGORY_COLORS } from '../constants/CATEGORY_COLORS';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [productId, setProductId] = useState('');
  const [colId, setColId] = useState('');
  const [isChanged, setIsChanged] = useState(false);

  const handleCellChange = (id, col, newValue) => {
    // Implementation of handleCellChange
  };

  const handleCellBlur = () => {
    // Implementation of handleCellBlur
  };

  const handleCellKeyDown = (event) => {
    // Implementation of handleCellKeyDown
  };

  const handleCellClick = (id, col) => {
    // Implementation of handleCellClick
  };

  return (
    <TableCell key="category" sx={editableCellStyle}>
      {isEditing ? (
        <FormControl size="small" fullWidth>
          <Select
            value={value}
            onChange={e => handleCellChange(productId, colId, e.target.value)}
            onBlur={handleCellBlur}
            autoFocus
            onKeyDown={handleCellKeyDown}
            displayEmpty
            open
            sx={{ fontWeight: isChanged ? 'bold' : 'normal', minWidth: 80 }}
          >
            <MenuItem value="">
              <em>Select...</em>
            </MenuItem>
            <MenuItem value="ebike">ebike</MenuItem>
            <MenuItem value="battery">battery</MenuItem>
            <MenuItem value="bike">bike</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Box sx={{ minWidth: 80, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Chip
            label={value || '—'}
            color={CATEGORY_COLORS[value] || 'default'}
            variant={value ? 'filled' : 'outlined'}
            onClick={() => handleCellClick(productId, colId)}
            sx={{ cursor: 'pointer', bgcolor: value ? undefined : '#eee', color: value ? undefined : '#888', fontWeight: isChanged ? 'bold' : 'normal', '&:hover': { bgcolor: '#fffbe6' } }}
          />
        </Box>
      )}
    </TableCell>
  );
};

export default ProductsTable; 