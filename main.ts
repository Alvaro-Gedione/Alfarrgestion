// Enums
enum TaskStatus {
    Pending = "Pending",
    InProgress = "In Progress",
    Completed = "Completed"
}

// Abstract User class
abstract class User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        protected password: string
    ) {}

    authentication(): boolean {
        // Lógica de autenticação padrão para todos os usuários
        return this.email.endsWith("@empresa.com") && this.password.length > 6;
    }

    changePassword(newPassword: string): void {
        this.password = newPassword;
    }

    updateProfile(updateData: Partial<Omit<User, 'id'>>): void {
        Object.assign(this, updateData);
    }
}

// Notification class
class AppNotification {
    constructor(
        public id: number,
        public message: string,
        public isRead: boolean = false,
        public createdAt: Date = new Date(),
        public recipient: User // Composition with User
    ) {}

    markAsRead(): void {
        this.isRead = true;
    }
}

// Task class
class Task {
    constructor(
        public id: number,
        public description: string,
        public timeLimit: Date,
        public conclusionTime: Date | null = null,
        public status: TaskStatus = TaskStatus.Pending,
        public assignedTo?: User // Aggregation with User
    ) {}

    isFinished(): boolean {
        return this.status === TaskStatus.Completed;
    }

    updateStatus(newStatus: TaskStatus): void {
        this.status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this.conclusionTime = new Date();
        }
    }

    // Association with Notification
    public notifications: AppNotification[] = [];
    addNotification(notification: AppNotification): void {
        this.notifications.push(notification);
    }
}

// Event class
class AppEvent {
    constructor(
        public name: string,
        public dateStart: Date,
        public dateFinish: Date,
        public description: string,
        public location: string,
        public createdBy: Admin // Composition with Admin
    ) {}

    warning(): void {
        console.log(`Event "${this.name}" is approaching!`);
    }

    // Association with Notification
    public notifications: AppNotification[] = [];
    addNotification(notification: AppNotification): void {
        this.notifications.push(notification);
    }

    // Aggregation with User (participants)
    public participants: User[] = [];
    addParticipant(user: User): void {
        this.participants.push(user);
    }
}

// Manager class (inherits from User)
class Manager extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        public department: string
    ) {
        super(id, name, email, password);
    }

    assignJob(task: Task, employee: Employee): void {
        task.assignedTo = employee;
        console.log(`Task "${task.description}" assigned to ${employee.name}`);
    }

    // Aggregation with Employee
    public employees: Employee[] = [];
    addEmployee(employee: Employee): void {
        this.employees.push(employee);
    }
}

// Employee class (inherits from User)
class Employee extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        public position: string,
        public shift: string,
        public manager?: Manager // Aggregation with Manager
    ) {
        super(id, name, email, password);
    }
}

// Admin class (inherits from User)
class Admin extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string
    ) {
        super(id, name, email, password);
    }

    createUser(userData: { name: string; email: string; password: string }): User {
        // In a real implementation, this would return a Manager, Employee or Admin
        const id = Math.floor(Math.random() * 1000);
        return new Employee(id, userData.name, userData.email, userData.password, "", "");
    }

    updateUser(user: User, updateData: Partial<User>): void {
        user.updateProfile(updateData);
    }

    deleteUser(user: User): void {
        console.log(`User ${user.name} deleted`);
    }

    createEvent(eventData: Omit<AppEvent, 'createdBy'>): AppEvent {
            return new AppEvent(
            eventData.name,
            eventData.dateStart,
            eventData.dateFinish,
            eventData.description,
            eventData.location,
            this
        );
    }

    updateEvent(event: AppEvent, updateData: Partial<AppEvent>): void {
        Object.assign(event, updateData);
    }

    deleteEvent(event: AppEvent): void {
        console.log(`Event "${event.name}" deleted`);
    }
}

// Report class
class CustomReport {
    constructor(
        public id: number,
        public date: Date,
        public type: string,
        public content: string
    ) {}

    generateReport(): string {
        return this.content;
    }
}

// Product class
class Product {
    constructor(
        public id: number,
        public name: string,
        public description: string,
        public price: number,
        public category: string,
        public supplier: string
    ) {}
}

// Sale class
class Sale {
    constructor(
        public id: number,
        public date: Date,
        public products: Product[] = [] // Composition with Product
    ) {}

    totalAmount(): number {
        return this.products.reduce((sum, product) => sum + product.price, 0);
    }
}

// Stock class
class Stock {
    private products: Product[] = []; // Composition with Product

    constructor(
        public id: number,
        public currentQuantity: number,
        public expirationDate: Date
    ) {}

    registerProduct(product: Product): void {
        this.products.push(product);
    }

    updateProduct(productId: number, updateData: Partial<Product>): void {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            Object.assign(product, updateData);
        }
    }

    deleteProduct(productId: number): void {
        this.products = this.products.filter(p => p.id !== productId);
    }
}

// ========== Example Usage ==========
console.log("=== Creating Users ===");
const admin = new Admin(1, "Admin User", "admin@example.com", "secure123");
const manager = new Manager(2, "Manager User", "manager@example.com", "manager123", "Sales");
const employee = new Employee(3, "Employee User", "employee@example.com", "employee123", "Sales Associate", "Morning", manager);

console.log(admin);
console.log(manager);
console.log(employee);

console.log("\n=== Task Management ===");
const task = new Task(1, "Complete sales report", new Date('2023-12-31'));
manager.assignJob(task, employee);
task.updateStatus(TaskStatus.InProgress);
console.log(task);

console.log("\n=== Event Management ===");
const evento = admin.createEvent({
    name: "Company Meeting",
    dateStart: new Date('2023-11-15'),
    dateFinish: new Date('2023-11-16'),
    description: "Annual company meeting",
    location: "Main Office",
    warning: function (): void {
        throw new Error("Function not implemented.");
    },
    notifications: [],
    addNotification: function (notification: AppNotification): void {
        throw new Error("Function not implemented.");
    },
    participants: [],
    addParticipant: function (user: User): void {
        throw new Error("Function not implemented.");
    }
});
evento.addParticipant(manager);
evento.addParticipant(employee);
console.log(evento);

console.log("\n=== Notifications ===");
const notif1 = new AppNotification(1, "New task assigned", false, new Date(), employee);
const notif2 = new AppNotification(2, "Event reminder", false, new Date(), manager);
task.addNotification(notif1);
evento.addNotification(notif2);
console.log(notif1);
console.log(notif2);

console.log("\n=== Product & Sales ===");
const product = new Product(1, "Laptop", "High performance laptop", 999.99, "Electronics", "Tech Supplier");
const sale = new Sale(1, new Date());
sale.products.push(product);
console.log("Sale total:", sale.totalAmount());

console.log("\n=== Stock Management ===");
const stock = new Stock(1, 10, new Date('2024-12-31'));
stock.registerProduct(product);
console.log(stock);

console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());