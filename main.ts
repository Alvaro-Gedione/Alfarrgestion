// ============= Enums =============
enum TaskStatus {
    Pending = "Pending",
    InProgress = "In Progress",
    Completed = "Completed"
}

// ============= Classes Base =============
abstract class User {
    private _notifications: AppNotification[] = []; // Composição (1-*)
    private _tasks: Task[] = []; // Agregação (*-*)
    private _events: AppEvent[] = []; // Agregação (*-*)

    constructor(
        private _id: number,
        private _name: string,
        private _email: string,
        private _password: string
    ) {}

    // Getters básicos
    get id(): number { return this._id; }
    get name(): string { return this._name; }
    get email(): string { return this._email; }

    // Métodos para AppNotification (Composição 1-*)
    addNotification(message: string): AppNotification {
        const notification = new AppNotification(
            this._notifications.length + 1,
            message,
            false,
            new Date(),
            this
        );
        this._notifications.push(notification);
        return notification;
    }

    get notifications(): ReadonlyArray<AppNotification> {
        return [...this._notifications];
    }

    // Métodos para Task (Agregação *-*)
    assignTask(task: Task): void {
        if (!this._tasks.some(t => t.id === task.id)) {
            this._tasks.push(task);
            task.assignUser(this);
        }
    }

    get tasks(): ReadonlyArray<Task> {
        return [...this._tasks];
    }

    // Métodos para AppEvent (Agregação *-*)
    registerForEvent(event: AppEvent): void {
        if (!this._events.some(e => e.id === event.id)) {
            this._events.push(event);
            event.addParticipant(this);
        }
    }

    get events(): ReadonlyArray<AppEvent> {
        return [...this._events];
    }


    authentication(): boolean {
        // Lógica de autenticação padrão para todos os usuários
        return this.email.endsWith("@empresa.com") && this._password.length > 6;
    }

    changePassword(newPassword: string): void {
        this._password = newPassword;
    }

    updateProfile(updateData: Partial<Omit<User, 'id'>>): void {
        Object.assign(this, updateData);
    }
}

// ============= Classes Especializadas (Herança) =============
class Manager extends User {
    private _employees: Employee[] = []; // Agregação (1-*)

    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        private _department: string
    ) {
        super(id, name, email, password);
    }

    get department(): string { return this._department; }

    // Métodos para Employee (Agregação 1-*)
    addEmployee(employee: Employee): void {
        if (!this._employees.some(e => e.id === employee.id)) {
            this._employees.push(employee);
            employee.manager = this;
        }
    }

    get employees(): ReadonlyArray<Employee> {
        return [...this._employees];
    }
}

class Employee extends User {
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        private _position: string,
        private _shift: string,
        private _manager?: Manager // Agregação (*-1)
    ) {
        super(id, name, email, password);
    }

    get manager(): Manager | undefined { return this._manager; }
    set manager(manager: Manager | undefined) { this._manager = manager; }
}

class Admin extends User {
    private _createdEvents: AppEvent[] = []; // Composição (1-*)
    private _generatedReports: CustomReport[] = []; // Associação (*-*)

    constructor(
        id: number,
        name: string,
        email: string,
        password: string
    ) {
        super(id, name, email, password);
    }

    // Métodos para AppEvent (Composição 1-*)
    createEvent(eventData: { name: string; dateStart: Date; dateFinish: Date; description: string; location: string }): AppEvent {
        const event = new AppEvent(
            this._createdEvents.length + 1,
            eventData.name,
            eventData.dateStart,
            eventData.dateFinish,
            eventData.description,
            eventData.location,
            this
        );
        this._createdEvents.push(event);
        return event;
    }

    get createdEvents(): ReadonlyArray<AppEvent> {
        return [...this._createdEvents];
    }

    // Métodos para Report (Associação *-*)
    generateReport(type: string, content: string): CustomReport {
        const report = new CustomReport(
            this._generatedReports.length + 1,
            new Date(),
            type,
            content
        );
        this._generatedReports.push(report);
        return report;
    }

    get reports(): ReadonlyArray<CustomReport> {
        return [...this._generatedReports];
    }
}

// ============= Classes de Domínio =============
class Task {
    private _subTasks: Task[] = []; // Auto-Agregação (*-*)
    private _assignedUsers: User[] = []; // Agregação (*-*)
    private _notifications: AppNotification[] = []; // Associação (*-*)

    constructor(
        private _id: number,
        private _description: string,
        private _timeLimit: Date,
        private _conclusionTime: Date | null = null,
        private _status: TaskStatus = TaskStatus.Pending
    ) {}

    // Getter for id
    get id(): number {
        return this._id;
    }

    // Métodos para User (Agregação *-*)
    assignUser(user: User): void {
        if (!this._assignedUsers.some(u => u.id === user.id)) {
            this._assignedUsers.push(user);
            user.assignTask(this);
        }
    }

    get assignedUsers(): ReadonlyArray<User> {
        return [...this._assignedUsers];
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }

    get notifications(): ReadonlyArray<AppNotification> {
        return [...this._notifications];
    }

    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task: Task): void {
        if (!this._subTasks.some(t => t.id === task.id)) {
            this._subTasks.push(task);
        }
    }

    get subTasks(): ReadonlyArray<Task> {
        return [...this._subTasks];
    }

    // Outros métodos
    updateStatus(newStatus: TaskStatus): void {
        this._status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this._conclusionTime = new Date();
        }
    }

    isFinished(): boolean {
        return this._status === TaskStatus.Completed;
    }
}

class AppEvent {
    private _participants: User[] = []; // Agregação (*-*)
    private _notifications: AppNotification[] = []; // Associação (*-*)

    constructor(
        private _id: number,
        private _name: string,
        private _dateStart: Date,
        private _dateFinish: Date,
        private _description: string,
        private _location: string,
        private _createdBy: Admin // Composição (*-1)
    ) {}

    // Getter for id
    get id(): number {
        return this._id;
    }

    // Métodos para User (Agregação *-*)
    addParticipant(user: User): void {
        if (!this._participants.some(p => p.id === user.id)) {
            this._participants.push(user);
            user.registerForEvent(this);
        }
    }

    get participants(): ReadonlyArray<User> {
        return [...this._participants];
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }

    get notifications(): ReadonlyArray<AppNotification> {
        return [...this._notifications];
    }

    // Outros métodos
    warning(): void {
        console.log(`AppEvent "${this._name}" is coming soon!`);
    }
}

class AppNotification {
    constructor(
        private _id: number,
        private _message: string,
        private _isRead: boolean,
        private _createdAt: Date,
        private _recipient: User // Composição (*-1)
    ) {}

    // Getter for id
    get id(): number {
        return this._id;
    }

    markAsRead(): void {
        this._isRead = true;
    }
}

class CustomReport {
    constructor(
        private _id: number,
        private _date: Date,
        private _type: string,
        private _content: string
    ) {}

    generateReport(): string {
        return this._content;
    }
}

class Resource {
    constructor(
        private _id: number,
        private _name: string,
        private _description: string,
        private _price: number,
        private _category: string,
        private _supplier: string
    ) {}

    get id(): number {
        return this._id;
    }

    get price(): number {
        return this._price;
    }
}

class Sale {
    private _resources: Resource[] = []; // Composição (*-*)

    get resources(): ReadonlyArray<Resource> {
        return [...this._resources];
    }

    constructor(
        private _id: number,
        private _date: Date
    ) {}

    Resource(resource: Resource): void {
        this._resources.push(resource);
    }

    totalAmount(): number {
        return this._resources.reduce((sum, resource) => sum + resource.price, 0);
    }
}

class ResourceGroup {
    private _resources: Resource[] = []; // Composição (*-*)

    constructor(
        private _id: number,
        private _currentQuantity: number,
        private _expirationDate: Date
    ) {}

    registerResource(resource: Resource): void {
        this._resources.push(resource);
    }

    updateResource(resourceId: number, updateData: Partial<Resource>): void {
        const resource = this._resources.find(p => p.id === resourceId);
        if (resource) {
            Object.assign(resource, updateData);
        }
    }

    deleteResource(resourceId: number): void {
        this._resources = this._resources.filter(p => p.id !== resourceId);
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
manager.assignTask(task);
task.updateStatus(TaskStatus.InProgress);
console.log(task);

console.log("\n=== AppEvent Management ===");
const evento = admin.createEvent({
    name: "Company Meeting",
    dateStart: new Date('2023-11-15'),
    dateFinish: new Date('2023-11-16'),
    description: "Annual company meeting",
    location: "Main Office",
});
evento.addParticipant(manager);
evento.addParticipant(employee);
console.log(evento);

console.log("\n=== Notifications ===");
const notif1 = new AppNotification(1, "New task assigned", false, new Date(), employee);
const notif2 = new AppNotification(2, "AppEvent reminder", false, new Date(), manager);
task.addNotification(notif1);
evento.addNotification(notif2);
console.log(notif1);
console.log(notif2);
console.log("\n=== Resource & Sales ===");
const resource = new Resource(1, "Laptop", "High performance laptop", 999.99, "Electronics", "Tech Supplier");
const sale = new Sale(1, new Date());
// Add resource to the sale
sale.Resource(resource);
console.log("Sale total:", sale.totalAmount());

console.log("\n=== ResourceGroup Management ===");
const resourceGroup = new ResourceGroup(1, 10, new Date('2024-12-31'));
resourceGroup.registerResource(resource);
console.log(resourceGroup);

console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());