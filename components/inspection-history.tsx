"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Calendar, MapPin, Phone, User } from "lucide-react";

// Mock data for demonstration
const mockInspections = [
	{
		id: "1",
		consumerName: "Rajesh Kumar",
		mobileNumber: "+91 9479335528",
		address: "123 MG Road, Bangalore",
		consumerNumber: "LPG001234",
		date: "2024-01-15",
		status: "Completed",
		totalAmount: 850.0,
		images: ["/placeholder.svg?height=100&width=100"],
		passedQuestions: 11,
		totalQuestions: 12,
	},
	{
		id: "2",
		consumerName: "Priya Sharma",
		mobileNumber: "+91 9876543211",
		address: "456 Brigade Road, Bangalore",
		consumerNumber: "LPG001235",
		date: "2024-01-14",
		status: "Completed",
		totalAmount: 1200.0,
		images: [
			"/placeholder.svg?height=100&width=100",
			"/placeholder.svg?height=100&width=100",
		],
		passedQuestions: 12,
		totalQuestions: 12,
	},
	{
		id: "3",
		consumerName: "Amit Patel",
		mobileNumber: "+91 9876543212",
		address: "789 Commercial Street, Bangalore",
		consumerNumber: "LPG001236",
		date: "2024-01-13",
		status: "Issues Found",
		totalAmount: 650.0,
		images: ["/placeholder.svg?height=100&width=100"],
		passedQuestions: 9,
		totalQuestions: 12,
	},
];

export function InspectionHistory() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedInspection, setSelectedInspection] = useState<string | null>(
		null
	);

	const filteredInspections = mockInspections.filter(
		(inspection) =>
			inspection.consumerName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			inspection.consumerNumber
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			inspection.mobileNumber.includes(searchTerm)
	);

	const selectedInspectionData = mockInspections.find(
		(i) => i.id === selectedInspection
	);

	if (selectedInspection && selectedInspectionData) {
		return (
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<Button variant='outline' onClick={() => setSelectedInspection(null)}>
						← Back to History
					</Button>
					<Badge
						variant={
							selectedInspectionData.status === "Completed"
								? "default"
								: "destructive"
						}
					>
						{selectedInspectionData.status}
					</Badge>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className='text-lg'>Inspection Details</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-1 gap-4'>
							<div className='flex items-center space-x-2'>
								<User className='w-4 h-4 text-gray-500' />
								<span className='font-medium'>
									{selectedInspectionData.consumerName}
								</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Phone className='w-4 h-4 text-gray-500' />
								<span>{selectedInspectionData.mobileNumber}</span>
							</div>
							<div className='flex items-center space-x-2'>
								<MapPin className='w-4 h-4 text-gray-500' />
								<span className='text-sm'>
									{selectedInspectionData.address}
								</span>
							</div>
							<div className='flex items-center space-x-2'>
								<Calendar className='w-4 h-4 text-gray-500' />
								<span>
									{new Date(selectedInspectionData.date).toLocaleDateString(
										"en-GB",
										{
											day: "2-digit",
											month: "short",
											year: "numeric",
										}
									)}
								</span>
							</div>
						</div>

						<div className='border-t pt-4'>
							<h4 className='font-medium mb-2'>Safety Check Results</h4>
							<div className='flex items-center space-x-4'>
								<div className='text-center'>
									<div className='text-2xl font-bold text-green-600'>
										{selectedInspectionData.passedQuestions}
									</div>
									<div className='text-sm text-gray-600'>Passed</div>
								</div>
								<div className='text-center'>
									<div className='text-2xl font-bold text-gray-400'>
										{selectedInspectionData.totalQuestions -
											selectedInspectionData.passedQuestions}
									</div>
									<div className='text-sm text-gray-600'>Failed</div>
								</div>
								<div className='text-center'>
									<div className='text-2xl font-bold'>
										{selectedInspectionData.totalQuestions}
									</div>
									<div className='text-sm text-gray-600'>Total</div>
								</div>
							</div>
						</div>

						<div className='border-t pt-4'>
							<h4 className='font-medium mb-2'>Kitchen Images</h4>
							<div className='grid grid-cols-2 gap-4'>
								{selectedInspectionData.images.map((image, index) => (
									<img
										key={index}
										src={image || "/placeholder.svg"}
										alt={`Kitchen ${index + 1}`}
										className='w-full h-32 object-cover rounded-lg border'
									/>
								))}
							</div>
						</div>

						<div className='border-t pt-4'>
							<div className='flex justify-between items-center'>
								<span className='font-medium'>Total Amount:</span>
								<span className='text-lg font-bold text-green-600'>
									₹{selectedInspectionData.totalAmount.toFixed(2)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Search */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
				<Input
					placeholder='Search by name, consumer number, or mobile...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='pl-10'
				/>
			</div>

			{/* Inspections List */}
			<div className='space-y-3'>
				{filteredInspections.length === 0 ? (
					<Card>
						<CardContent className='p-8 text-center text-gray-500'>
							{searchTerm
								? "No inspections found matching your search."
								: "No inspections completed yet."}
						</CardContent>
					</Card>
				) : (
					filteredInspections.map((inspection) => (
						<Card
							key={inspection.id}
							className='cursor-pointer hover:shadow-md transition-shadow'
						>
							<CardContent className='p-4'>
								<div className='flex justify-between items-start mb-3'>
									<div>
										<h3 className='font-semibold text-lg'>
											{inspection.consumerName}
										</h3>
										<p className='text-sm text-gray-600'>
											{inspection.consumerNumber}
										</p>
									</div>
									<Badge
										variant={
											inspection.status === "Completed"
												? "default"
												: "destructive"
										}
									>
										{inspection.status}
									</Badge>
								</div>

								<div className='space-y-2 text-sm text-gray-600 mb-3'>
									<div className='flex items-center space-x-2'>
										<Phone className='w-3 h-3' />
										<span>{inspection.mobileNumber}</span>
									</div>
									<div className='flex items-center space-x-2'>
										<Calendar className='w-3 h-3' />
										<span>
											{new Date(inspection.date).toLocaleDateString()}
										</span>
									</div>
									<div className='flex items-center space-x-2'>
										<MapPin className='w-3 h-3' />
										<span className='truncate'>{inspection.address}</span>
									</div>
								</div>

								<div className='flex justify-between items-center'>
									<div className='flex items-center space-x-4'>
										<span className='text-sm'>
											Safety: {inspection.passedQuestions}/
											{inspection.totalQuestions}
										</span>
										<span className='text-sm font-medium text-green-600'>
											₹{inspection.totalAmount.toFixed(2)}
										</span>
									</div>
									<Button
										size='sm'
										variant='outline'
										onClick={() => setSelectedInspection(inspection.id)}
									>
										<Eye className='w-4 h-4 mr-1' />
										View
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
