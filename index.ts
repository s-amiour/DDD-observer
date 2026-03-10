import { v4 as uuidv4 } from "uuid"

// NOTE: This file's contents will be separated and structured in accordance with the web-rest-api/DDD-observer:ddd-structure project structure
//		 when the DDD concept is implemented.

// To search file for tested silent bugs: search 'SILENT_BUG'

/*********************************************************************************************************
									Phase 2: Primitive Type Objects
*********************************************************************************************************/
console.log("=================  Phase1: Primitive Type Objects  =================")
// Object type definition
type Table = {
	id: string,
	numOfSeats: number,
	isReserved: boolean,
	status: string
}

// Instances
const facadeTableId: string = uuidv4();
const facadeTable: Table = {
	id: facadeTableId,
	numOfSeats: 2,
	isReserved: false,
	status: "available"
};

const interiorTable: Table = {
	id: uuidv4(),
	numOfSeats: 4,
	isReserved: false,
	status: "available"
};

const loungeTableId: string = uuidv4();
const loungeTable: Table = {
	id: loungeTableId,
	numOfSeats: 10,
	isReserved: true,
	status: "available"
};


// Factory (utility) function
// Search for possible table for group of customers
const findTableForWalkIn = (tables: Table[], groupSize: number): Table | undefined => {
	return tables.find(table => 
		table.numOfSeats >= groupSize &&
		!table.isReserved &&
		table.status == "available"  // Prone to silent bug: capitalization possibility
	);
};


// Testing
const restaurantTables = [facadeTable, interiorTable, loungeTable];
const tableForFour = findTableForWalkIn(restaurantTables, 4);  // should return like { id: '68ae4202-004d-4e0d-b9f0-216fa9b12be8', numOfSeats: 4, isReserved: false, status: 'available' }

console.log(tableForFour);

/******************************
	Exposing Silent Bug
*******************************/

interiorTable.id = "available";

// Testing#2
const newRestaurantTables = [facadeTable, interiorTable, loungeTable];
const newTableForFour = findTableForWalkIn(newRestaurantTables, 4);  // { id: 'available', numOfSeats: 4, isReserved: false, status: 'available' } (SILENT_BUG)

console.log(newTableForFour)

/*********************************************************************************************************
									Phase 2.b: Addition of `Order` object type
*********************************************************************************************************/
console.log("=================  Phase2.b: Orders  =================")
type Order = {
	id: string,
	tableId: string,
	totalAmount: number,
	isPaid: boolean,
	status: string,
}


const orderOne: Order = {
	id: uuidv4(),
	tableId: facadeTableId,
	totalAmount: 45.40,
	isPaid: false,
	status: "preparing",
}

const orderTwo: Order = {
	id: uuidv4(),
	tableId: loungeTableId,
	totalAmount: 7.90,
	isPaid: true,
	status: "done",
}

const getUnpaidTotal = (orders: Order[]): number => {
	return orders
		.filter(order => !order.isPaid)
		.reduce((sum, order) => sum + order.totalAmount, 0)  // noteToSelf: sum & order are just variables to hold a running value and the element, respectively.
}


// Testing
const restaurantOrders = [orderOne, orderTwo];
const unpaidTotal = getUnpaidTotal(restaurantOrders);  // should return 45.40

console.log(unpaidTotal)

/******************************
	Exposing Silent Bug
*******************************/

orderTwo.isPaid = false;
orderTwo.totalAmount = -97.20;

// Testing#2
const newRestaurantOrders = [orderOne, orderTwo];
const newUnpaidTotal = getUnpaidTotal(newRestaurantOrders);  // -51.80 (SILENT_BUG)

console.log(newUnpaidTotal)

