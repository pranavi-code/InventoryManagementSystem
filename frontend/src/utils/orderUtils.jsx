import React from 'react';
import { 
    FaClock, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaTruck, 
    FaBox, 
    FaExclamationTriangle 
} from 'react-icons/fa';

export const getStatusIcon = (status) => {
    switch (status) {
        case 'Pending': return <FaClock className="text-yellow-500" />;
        case 'Approved': return <FaCheckCircle className="text-green-500" />;
        case 'Processing': return <FaBox className="text-blue-500" />;
        case 'Shipped': return <FaTruck className="text-purple-500" />;
        case 'Delivered': return <FaCheckCircle className="text-green-600" />;
        case 'Cancelled': return <FaTimesCircle className="text-red-500" />;
        case 'Rejected': return <FaExclamationTriangle className="text-red-600" />;
        default: return <FaClock className="text-gray-500" />;
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Processing': return 'bg-blue-100 text-blue-800';
        case 'Shipped': return 'bg-purple-100 text-purple-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Low': return 'bg-gray-100 text-gray-800';
        case 'Medium': return 'bg-blue-100 text-blue-800';
        case 'High': return 'bg-orange-100 text-orange-800';
        case 'Urgent': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};