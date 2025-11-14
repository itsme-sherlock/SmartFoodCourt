    import React from 'react';

export const metadata = {
	title: 'Employee - Food Court',
};

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50">
			{children}
		</div>
	);
}
