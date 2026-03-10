import { v4 as uuidv4 } from "uuid"

// NOTE: This file's contents will be separated and structured in accordance to the web-rest-api/DDD-observer:ddd-structure project structure
//		 when the DDD concept is implemented.

// To search file for tested silent bugs: search 'SILENT_BUG'

/*********************************************************************************************************
										Phase 5: Value Object
*********************************************************************************************************/
console.log("=================  Table  =================")

type TableId = string & { readonly __brand: unique symbol  };
type SeatCount = number & { readonly __brand: unique symbol  };
type TableStatus = "available" | "occupied" | "cleaning" | "out_of_service";


type Table = {
	id: TableId,
	numOfSeats: SeatCount,
	isReserved: boolean,  // isReserved is not branded. T/F already conforms to any business rule.
	status: TableStatus
}


const makeTableId = (id: string): TableId => {
	const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	
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


// =======================================================================================================

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


/*********************************************************************************************************
											`Order` object type
*********************************************************************************************************/
console.log("=================  Orders  =================")
console.log("         ==  Value Object (Money)  ==        ")

// Define related fields (reusing existing Price type)
type Currency = "USD" | "EUR" | "GBP";

// Define Value Object interface and make it immutable (readonly)
type Money = {
    readonly amount: Price;
    readonly currency: Currency;
};

type OrderId = string & { readonly __brand: unique symbol }
type Price = number & { readonly __brand: unique symbol }
type OrderStatus = "received" | "preparing" | "ready" | "done"

type Order = {
	id: OrderId,
	tableId: TableId,
	totalAmount: Money,
	isPaid: boolean,
	status: OrderStatus,
}


const makeOrderId = (id: string): OrderId => {
	const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	
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
	const roundedPrice = Math.round(price * 100) / 100;

	return roundedPrice as Price;
};

// == Factory functions ==
const makeMoney = (amount: number, currency: Currency) => {
	const validatedPrice = makePrice(amount);

	return {
		amount: validatedPrice,
		currency: currency
	};
};

// Factory (utility) function
const addMoney = (moneyA: Money, moneyB: Money): Money => {
    if (moneyA.currency !== moneyB.currency) {
        throw new Error(`Currency mismatch: Cannot add ${moneyA.currency} and ${moneyB.currency}`);
    }
    
    // Return brand new Money object
    return makeMoney(moneyA.amount + moneyB.amount, moneyA.currency);
};


const orderOne: Order = {
	id: makeOrderId(uuidv4()),
	tableId: facadeTableId,
	totalAmount: makeMoney(45.40, "EUR"),
	isPaid: false,
	status: "preparing",
}

const orderTwo: Order = {
	id: makeOrderId(uuidv4()),
	tableId: loungeTableId,
	totalAmount: makeMoney(7.90, "GBP"),
	isPaid: true,
	status: "done",
}

const getUnpaidTotal = (orders: Order[]): number => {
	return orders
		.filter(order => !order.isPaid)
		.reduce((sum, order) => sum + order.totalAmount.amount, 0)  // noteToSelf: sum & order are just variables to hold a running value and the element, respectively.
}


// Testing
const restaurantOrders = [orderOne, orderTwo];
const unpaidTotal = getUnpaidTotal(restaurantOrders);  // should return 45.40

console.log(unpaidTotal)
