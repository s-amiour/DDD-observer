import { v4 as uuidv4 } from "uuid"

// NOTE: This file's contents will be separated and structured in accordance to the web-rest-api/DDD-observer:ddd-structure project structure
//		 when the DDD concept is implemented.

// To search file for tested silent bugs: search 'SILENT_BUG'

/*********************************************************************************************************
								Phase 3 & 4: Branded Types + Smart Contructors
*********************************************************************************************************/
console.log("=================  Table  =================")

// Branded types and 
type TableId = string & { readonly __brand: unique symbol  };
type SeatCount = number & { readonly __brand: unique symbol  };
type TableStatus = "available" | "occupied" | "cleaning" | "out_of_service";


// Object type definition
type Table = {
	id: TableId,
	numOfSeats: SeatCount,
	isReserved: boolean,  // isReserved is not branded. T/F already conforms to any business rule.
	status: TableStatus
}

// Smart Constructors (the only way to create branded types)

const makeTableId = (id: string): TableId => {
	// Business logic
	const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	
	// .test() to check matchability of input
	if (uuidRegex.test(id)){
		return id as TableId;
	}

	throw new Error("id does not conform to Regex syntax, TableId's business rule.");
};

const makeSeatCount = (numOfSeats: number): SeatCount => {
	if (numOfSeats <= 0){
		throw new Error("Table cannot be empty");
	}
	if (!Number.isInteger(numOfSeats)){
		throw new Error("Number of tables must be a whole number.");
	}
	return numOfSeats as SeatCount;
};

// TableStatus does not need a contructor, as it already meets business expectation.

// =======================================================================================================

// Instances
const facadeTableId: TableId = makeTableId(uuidv4());
const facadeTable: Table = {
	id: facadeTableId,
	numOfSeats: makeSeatCount(2),
	isReserved: false,
	status: "available"
};

const interiorTable: Table = {
	id: makeTableId(uuidv4()),
	numOfSeats: makeSeatCount(4),
	isReserved: false,
	status: "available"
};

const loungeTableId: TableId = makeTableId(uuidv4());
const loungeTable: Table = {
	id: loungeTableId,
	numOfSeats: makeSeatCount(10),
	isReserved: true,
	status: "cleaning"
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
		Error Display
*******************************/

//PHASE-2-TEST (uncomment to use)
// interiorTable.numOfSeats = "asd";  // doesn't throw an error (SILENT_BUG)

// Answering `Check your understanding`, Price and number are not the same type because the intersection (&) forces Price to require an extra exclusive __brand property, creating a structural difference that the compiler treats as a distinct, stricter type

const restaurantTables2 = [facadeTable, interiorTable, loungeTable];
const tableForFour2 = findTableForWalkIn(restaurantTables2, 4);  // { id: 'available', numOfSeats: 4, isReserved: false, status: 'available' } (SILENT_BUG)

console.log(`Phase-2-test:`, tableForFour2)

//PHASE-3-TEST

// Answering `Check your understanding`, Price and number are not the same type because the intersection (&) forces Price to require an extra exclusive __brand property, creating a structural difference that the compiler treats as a distinct, stricter type
// facadeTable.numOfSeats = makeSeatCount("unknown")  // Error thrown

const restaurantTables3 = [facadeTable, interiorTable, loungeTable];
const tableForThree = findTableForWalkIn(restaurantTables3, 2);  // { id: 'available', numOfSeats: 4, isReserved: false, status: 'available' } (SILENT_BUG)

console.log(`Phase-3-test:`, tableForThree)



/*********************************************************************************************************
											`Order` object type
*********************************************************************************************************/
console.log("=================  Orders  =================")

type OrderId = string & { readonly __brand: unique symbol }
type Price = number & { readonly __brand: unique symbol }
type OrderStatus = "received" | "preparing" | "ready" | "done"

type Order = {
	id: OrderId,
	tableId: TableId,
	totalAmount: Price,
	isPaid: boolean,
	status: OrderStatus,
}


const makeOrderId = (id: string): OrderId => {
	// Business logic
	const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	
	// .test() to check matchability of input
	if (uuidRegex.test(id)){
		return id as OrderId;
	}

	throw new Error("id does not conform to Regex syntax, OrderId's business rule.");
};

const makePrice = (price: number): Price => {
	if (price <= 0){
		throw new Error("Price must be positive.")
	}
	if (!Number.isFinite(price)){
		throw new Error("Price must be a finite number.");
	}
	// Format as a 2-decimal float. Math.round is safest way
	const roundedPrice = Math.round(price * 100) / 100;

	return roundedPrice as Price;
};


const orderOne: Order = {
	id: makeOrderId(uuidv4()),
	tableId: facadeTableId,
	totalAmount: makePrice(45.40),
	isPaid: false,
	status: "preparing",
}

const orderTwo: Order = {
	id: makeOrderId(uuidv4()),
	tableId: loungeTableId,
	totalAmount: makePrice(7.90),
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
