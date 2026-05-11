export const products = [
  {
    id: '1',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 129.99,
    stock: 45,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'
  },
  {
    id: '2',
    name: 'Ergonomic Chair',
    category: 'Furniture',
    price: 299.0,
    stock: 12,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200&q=80'
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    price: 159.5,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=200&q=80'
  },
  {
    id: '4',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 199.99,
    stock: 30,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
  },
  {
    id: '5',
    name: 'Running Shoes',
    category: 'Apparel',
    price: 89.95,
    stock: 100,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80'
  },
  {
    id: '6',
    name: 'Leather Wallet',
    category: 'Accessories',
    price: 49.99,
    stock: 25,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1627123424574-181ce5171c98?w=200&q=80'
  },
  {
    id: '7',
    name: 'Coffee Maker',
    category: 'Home',
    price: 79.0,
    stock: 8,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80'
  }
];

export const orders = [
  {
    id: 'ORD-001',
    customer: 'Alex Thompson',
    date: '2023-10-25',
    total: 129.99,
    status: 'Completed',
    items: 1
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Chen',
    date: '2023-10-26',
    total: 458.5,
    status: 'Processing',
    items: 3
  },
  {
    id: 'ORD-003',
    customer: 'Mike Miller',
    date: '2023-10-26',
    total: 89.95,
    status: 'Pending',
    items: 1
  },
  {
    id: 'ORD-004',
    customer: 'Emily Wilson',
    date: '2023-10-24',
    total: 299.0,
    status: 'Cancelled',
    items: 1
  },
  {
    id: 'ORD-005',
    customer: 'David Garcia',
    date: '2023-10-27',
    total: 1250.0,
    status: 'Completed',
    items: 5
  }
];

export const customers = [
  {
    id: 'CUST-001',
    name: 'Alex Thompson',
    email: 'alex.t@example.com',
    orders: 12,
    totalSpent: 1450.5,
    status: 'Active'
  },
  {
    id: 'CUST-002',
    name: 'Sarah Chen',
    email: 'sarah.c@example.com',
    orders: 5,
    totalSpent: 890.0,
    status: 'Active'
  },
  {
    id: 'CUST-003',
    name: 'Mike Miller',
    email: 'mike.m@example.com',
    orders: 1,
    totalSpent: 89.95,
    status: 'New'
  },
  {
    id: 'CUST-004',
    name: 'Emily Wilson',
    email: 'emily.w@example.com',
    orders: 0,
    totalSpent: 0,
    status: 'Inactive'
  }
];

export const payments = [
  {
    id: 'PAY-001',
    orderId: 'ORD-001',
    amount: 129.99,
    method: 'Credit Card',
    status: 'Success',
    date: '2023-10-25'
  },
  {
    id: 'PAY-002',
    orderId: 'ORD-002',
    amount: 458.5,
    method: 'PayPal',
    status: 'Success',
    date: '2023-10-26'
  },
  {
    id: 'PAY-003',
    orderId: 'ORD-003',
    amount: 89.95,
    method: 'Bank Transfer',
    status: 'Pending',
    date: '2023-10-26'
  },
  {
    id: 'PAY-004',
    orderId: 'ORD-005',
    amount: 1250.0,
    method: 'QR Payment',
    status: 'Success',
    date: '2023-10-27'
  }
];

export const kpiData = {
  revenue: { value: '$45,231.89', change: '+20.1%', trend: 'up' },
  orders: { value: '2,345', change: '+15.2%', trend: 'up' },
  conversion: { value: '3.2%', change: '-1.1%', trend: 'down' },
  activeUsers: { value: '573', change: '+201', trend: 'up' }
};
