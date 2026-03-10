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



/*********************************************************************************************************
                         
'lbvzPhases 6 & 7: Entities and The Observer Patter
*********************************************************************************************************/
console.log("\n=================  Phase 6 & 7: Entity & Observers  =================")

// --- 7a
// Define what an observer looks like (callback signature)
type Observer<T> = (event: T) => void;

// Define events entity can emit
type OrderEvent = 
    | { type: "OrderCreated", payload: { id: OrderId, tableId: TableId } }
    | { type: "OrderPaid", payload: { id: OrderId, amountPaid: Money } }
    | { type: "OrderCancelled", payload: { id: OrderId } };

// Phase 6 & 7b: entity definition (Immutable with Observers)

// We upgrade the Order type to an Entity that holds its own observers
type OrderEntity = {
    readonly id: OrderId;
    readonly tableId: TableId;
    readonly totalAmount: Money;
    readonly isPaid: boolean;
    readonly status: OrderStatus;
    readonly observers: Observer<OrderEvent>[]; // 7b: Subscriber list
}

// ---------------------------------------------------------
// Phase 6: Factory and State-Changing Functions
// ---------------------------------------------------------

// Creates the initial entity with a fresh ID
const createOrder = (tableId: TableId, initialAmount: Money): OrderEntity => {
    return {
        id: makeOrderId(uuidv4()),
        tableId: tableId ,
        totalAmount: initialAmount,
        isPaid: false,
        status: "received",
        observers: [] // Starts with no listeners
    };
};

// 7c: Helper function to notify all subscribers
const notifyObservers = (observers: Observer<OrderEvent>[], event: OrderEvent) => {
    observers.forEach(observer => observer(event));
};

// 7b: Subscribe function (Returns a NEW entity with the observer added)
const subscribeToOrder = (order: OrderEntity, observer: Observer<OrderEvent>): OrderEntity => {
    return {
        ...order,
        observers: [...order.observers, observer]
    };
};

// 7b: Unsubscribe function (Returns a NEW entity with the observer removed)
const unsubscribeFromOrder = (order: OrderEntity, observer: Observer<OrderEvent>): OrderEntity => {
    return {
        ...order,
        observers: order.observers.filter(obs => obs !== observer)
    };
};

// Phase 6: State Changing Function - PAY ORDER
const payOrder = (order: OrderEntity): OrderEntity => {
    // 1. Enforce Invariants (Guard Clauses)
    if (order.isPaid) {
        throw new Error("Invariant Violation: Order is already paid.");
    }
    if (order.status === "done") {
        throw new Error("Invariant Violation: Cannot pay a closed order.");
    }

    // 2. Return a NEW entity with updated state (Immutability)
    const updatedOrder: OrderEntity = {
        ...order,
        isPaid: true,
        status: "done"
    };

    // 3. Notify Observers (7c)
    notifyObservers(updatedOrder.observers, {
        type: "OrderPaid",
        payload: { id: updatedOrder.id, amountPaid: updatedOrder.totalAmount }
    });

    return updatedOrder;
};

// Phase 6: State Changing Function - CANCEL ORDER
const cancelOrder = (order: OrderEntity): OrderEntity => {
    // 1. Enforce Invariants
    if (order.isPaid) {
        throw new Error("Invariant Violation: Cannot cancel an order that has already been paid.");
    }

    // 2. Return NEW entity
    const updatedOrder: OrderEntity = {
        ...order,
        status: "done" // Or you could add "cancelled" to OrderStatus union
    };

    // 3. Notify Observers
    notifyObservers(updatedOrder.observers, {
        type: "OrderCancelled",
        payload: { id: updatedOrder.id }
    });

    return updatedOrder;
};

// ---------------------------------------------------------
// 7d. Wire it up and test it manually
// ---------------------------------------------------------

console.log("\n--- Starting Observer Test ---");

// 1. Create the Entity
let activeOrder = createOrder(facadeTableId, makeMoney(50.00, "USD"));

// 2. Define Observer Functions
const consoleLogger: Observer<OrderEvent> = (event) => {
    console.log(`[LOGGER] Event recorded: ${event.type} for Order ${event.payload.id}`);
};

const emailService: Observer<OrderEvent> = (event) => {
    if (event.type === "OrderPaid") {
        console.log(`[EMAIL] Sending receipt for amount: ${event.payload.amountPaid.amount} ${event.payload.amountPaid.currency}`);
    }
};

const uiUpdater: Observer<OrderEvent> = (event) => {
    console.log(`[UI] Refreshing dashboard due to ${event.type}...`);
};

// 3. Subscribe them to the entity (Notice we reassign activeOrder because it returns a NEW object)
activeOrder = subscribeToOrder(activeOrder, consoleLogger);
activeOrder = subscribeToOrder(activeOrder, emailService);
activeOrder = subscribeToOrder(activeOrder, uiUpdater);

console.log("Observers subscribed. Attempting payment...");

// 4. Trigger state change and confirm notifications
// Expect: Logger, Email, and UI logs to fire.
activeOrder = payOrder(activeOrder);

console.log("\nAttempting to cancel a paid order (Testing Invariants)...");

// 5. Test Invariant (Should throw error)
try {
    activeOrder = cancelOrder(activeOrder);
} catch (error) {
    console.error(`[BLOCKED] ${(error as Error).message}`);
}

console.log("\nUnsubscribing UI Updater and trying a new order...");

// 6. Test Unsubscribe
let secondOrder = createOrder(loungeTableId, makeMoney(15.00, "EUR"));
secondOrder = subscribeToOrder(secondOrder, consoleLogger);
secondOrder = subscribeToOrder(secondOrder, uiUpdater);

secondOrder = unsubscribeFromOrder(secondOrder, uiUpdater); // Remove UI Updater

// Expect: ONLY Logger to fire. UI should remain silent.
secondOrder = cancelOrder(secondOrder);