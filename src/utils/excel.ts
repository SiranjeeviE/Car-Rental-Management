import * as XLSX from 'xlsx';

export interface ExcelCarRow {
  Brand: string;
  Model: string;
  Category: string;
  'Daily Rate': number;
  Transmission: string;
  Status: string;
}

export interface SystemCar {
  id: number;
  brand: string;
  model: string;
  category: string;
  dailyRate: number;
  status: string;
  transmission: string;
}

export interface SystemBooking {
  id: number;
  customerName: string;
  contact: string;
  carId: number;
  carName: string;
  rentDays: number;
  totalPrice: number;
  bookingDate: string;
  status: string;
  membersCount: number;
  route: string;
}

export interface SystemFeedback {
  id: number;
  customerName: string;
  carName: string;
  serviceRating: number;
  carRating: number;
  comments: string;
  date: string;
}

// 1. Download Excel Template
export function downloadExcelTemplate() {
  const data = [
    {
      Brand: 'Hyundai',
      Model: 'Creta',
      Category: 'SUV',
      'Daily Rate': 2200,
      Transmission: 'Automatic',
      Status: 'Available'
    },
    {
      Brand: 'Maruti',
      Model: 'Swift',
      Category: 'Hatchback',
      'Daily Rate': 1000,
      Transmission: 'Manual',
      Status: 'Available'
    },
    {
      Brand: 'Mercedes',
      Model: 'C-Class',
      Category: 'Luxury',
      'Daily Rate': 12000,
      Transmission: 'Automatic',
      Status: 'Maintenance'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fleet Template');
  XLSX.writeFile(wb, 'Car_Import_Template.xlsx');
}

// 2. Export Entire Database to Excel
export function exportToExcel(
  cars: SystemCar[],
  bookings: SystemBooking[],
  feedbacks: SystemFeedback[]
) {
  // Cars Sheet
  const carsSheetData = cars.map(c => ({
    'Car ID': c.id,
    Brand: c.brand,
    Model: c.model,
    Category: c.category,
    'Daily Rate (INR)': c.dailyRate,
    Status: c.status,
    Transmission: c.transmission
  }));

  // Bookings Sheet
  const bookingsSheetData = bookings.map(b => ({
    'Booking ID': b.id,
    'Customer Name': b.customerName,
    Contact: b.contact,
    'Car ID': b.carId,
    'Car Name': b.carName,
    'Rental Days': b.rentDays,
    'Total Amount Paid': b.totalPrice,
    'Booking Date': b.bookingDate,
    Status: b.status,
    'Travel Passengers': b.membersCount,
    'Traveling Route': b.route
  }));

  // Feedbacks Sheet
  const feedbacksSheetData = feedbacks.map(f => ({
    'Review ID': f.id,
    'Customer Name': f.customerName,
    'Car Name': f.carName,
    'Service Rating': f.serviceRating,
    'Car Rating': f.carRating,
    'Written Feedback': f.comments,
    'Submit Date': f.date
  }));

  const wb = XLSX.utils.book_new();

  const wsCars = XLSX.utils.json_to_sheet(carsSheetData);
  XLSX.utils.book_append_sheet(wb, wsCars, 'Fleet Inventory');

  const wsBookings = XLSX.utils.json_to_sheet(bookingsSheetData);
  XLSX.utils.book_append_sheet(wb, wsBookings, 'Rentals Ledger');

  const wsFeedback = XLSX.utils.json_to_sheet(feedbacksSheetData);
  XLSX.utils.book_append_sheet(wb, wsFeedback, 'Customer Reviews');

  XLSX.writeFile(wb, 'RentDrive_Car_Rental_Report.xlsx');
}

// 3. Parse Uploaded Excel File for Bulk Import
export function parseExcelImport(
  file: File,
  onSuccess: (cars: Omit<SystemCar, 'id'>[]) => void,
  onError: (err: unknown) => void
) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      if (!evt.target || !evt.target.result) {
        throw new Error('Could not read file data.');
      }
      const data = new Uint8Array(evt.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Uploaded Excel sheet is empty!');
      }

      // Format objects for JSON bulk API
      const bulkCars: Omit<SystemCar, 'id'>[] = jsonData.map(row => ({
        brand: String(row['Brand'] || 'Unknown'),
        model: String(row['Model'] || 'Unknown'),
        category: String(row['Category'] || 'Sedan'),
        dailyRate: Number(row['Daily Rate']) || 1000,
        transmission: String(row['Transmission'] || 'Manual'),
        status: String(row['Status'] || 'Available')
      }));

      onSuccess(bulkCars);
    } catch (error) {
      onError(error);
    }
  };
  reader.readAsArrayBuffer(file);
}
