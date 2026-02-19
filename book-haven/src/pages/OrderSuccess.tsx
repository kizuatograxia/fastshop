import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
    const location = useLocation();
    const orderId = location.state?.orderId || 'Unknown';

    return (
        <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Thank you for your purchase. Your order #{orderId.slice(0, 8)}... has been successfully placed.
            </p>

            <div className="space-x-4">
                <Link to="/store">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
                <Link to="/notifications">
                    <Button>View Order Status</Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
