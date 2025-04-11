// ============= Enums =============
enum TaskStatus {
    Pending = "Pending",
    InProgress = "In Progress",
    Completed = "Completed"
}

// ============= Classes Base =============
abstract class User {
    private _notifications: AppNotification[] = [];
    private _tasks: Task[] = [];
    private _events: AppEvent[] = [];

    constructor(
        private _id: number,
        private _name: string,
        private _email: string,
        private _password: string
    ) { }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get notifications(): AppNotification[] {
        return this._notifications;
    }

    get tasks(): Task[] {
        return this._tasks;
    }

    get events(): AppEvent[] {
        return this._events;
    }

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

    assignTask(task: Task): void {
        if (!this._tasks.some(t => t.id === task.id)) {
            this._tasks.push(task);
            task.assignUser(this);
        }
    }

    registerForEvent(event: AppEvent): void {
        if (!this._events.some(e => e.id === event.id)) {
            this._events.push(event);
            event.addParticipant(this);
        }
    }

    authentication(): boolean {
        return this._email.endsWith("@empresa.com") && this._password.length > 6;
    }

    changePassword(newPassword: string): void {
        this._password = newPassword;
    }

    updateProfile(updateData: Partial<Omit<User, 'id'>>): void {
        Object.assign(this, updateData);
    }
}

class Manager extends User {
    private _employees: Employee[] = [];

    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        private _department: string
    ) {
        super(id, name, email, password);
    }

    get department(): string {
        return this._department;
    }

    set department(value: string) {
        this._department = value;
    }

    get employees(): Employee[] {
        return this._employees;
    }

    addEmployee(employee: Employee): void {
        if (!this._employees.some(e => e.id === employee.id)) {
            this._employees.push(employee);
            employee.manager = this;
        }
    }
}

class Employee extends User {
    private _manager?: Manager;

    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        private _position: string,
        private _shift: string,
        manager?: Manager
    ) {
        super(id, name, email, password);
        this._manager = manager;
    }

    get position(): string {
        return this._position;
    }

    set position(value: string) {
        this._position = value;
    }

    get shift(): string {
        return this._shift;
    }

    set shift(value: string) {
        this._shift = value;
    }

    get manager(): Manager | undefined {
        return this._manager;
    }

    set manager(value: Manager | undefined) {
        this._manager = value;
    }
}

class Admin extends User {
    private _createdEvents: AppEvent[] = [];
    private _generatedReports: CustomReport[] = [];

    get createdEvents(): AppEvent[] {
        return this._createdEvents;
    }

    get generatedReports(): CustomReport[] {
        return this._generatedReports;
    }

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
    ) { }

    get id(): number {
        return this._id;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get timeLimit(): Date {
        return this._timeLimit;
    }

    set timeLimit(value: Date) {
        this._timeLimit = value;
    }

    get conclusionTime(): Date | null {
        return this._conclusionTime;
    }

    set conclusionTime(value: Date | null) {
        this._conclusionTime = value;
    }

    get status(): TaskStatus {
        return this._status;
    }

    set status(value: TaskStatus) {
        this._status = value;
    }

    get subTasks(): Task[] {
        return this._subTasks;
    }

    get assignedUsers(): User[] {
        return this._assignedUsers;
    }

    get notifications(): AppNotification[] {
        return this._notifications;
    }

    // Métodos para User (Agregação *-*)
    assignUser(user: User): void {
        if (!this._assignedUsers.some(u => u.id === user.id)) {
            this._assignedUsers.push(user);
            user.assignTask(this);
        }
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }

    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task: Task): void {
        if (!this._subTasks.some(t => t.id === task.id)) {
            this._subTasks.push(task);
        }
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
    ) { }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get dateStart(): Date {
        return this._dateStart;
    }

    set dateStart(value: Date) {
        this._dateStart = value;
    }

    get dateFinish(): Date {
        return this._dateFinish;
    }

    set dateFinish(value: Date) {
        this._dateFinish = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get location(): string {
        return this._location;
    }

    set location(value: string) {
        this._location = value;
    }

    get createdBy(): Admin {
        return this._createdBy;
    }

    get participants(): User[] {
        return this._participants;
    }

    get notifications(): AppNotification[] {
        return this._notifications;
    }

    // Métodos para User (Agregação *-*)
    addParticipant(user: User): void {
        if (!this._participants.some(p => p.id === user.id)) {
            this._participants.push(user);
            user.registerForEvent(this);
        }
    }

    // Métodos para AppNotification (Associação *-*)
    addNotification(notification: AppNotification): void {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
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
    ) { }

    get id(): number {
        return this._id;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get isRead(): boolean {
        return this._isRead;
    }

    set isRead(value: boolean) {
        this._isRead = value;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    set createdAt(value: Date) {
        this._createdAt = value;
    }

    get recipient(): User {
        return this._recipient;
    }

    set recipient(value: User) {
        this._recipient = value;
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
    ) { }

    get id(): number {
        return this._id;
    }

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = value;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

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
    ) { }

    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }

    get category(): string {
        return this._category;
    }

    set category(value: string) {
        this._category = value;
    }

    get supplier(): string {
        return this._supplier;
    }

    set supplier(value: string) {
        this._supplier = value;
    }
}

class Sale {
    private _resources: Resource[] = []; // Composição (*-*)

    constructor(
        private _id: number,
        private _date: Date
    ) { }

    get id(): number {
        return this._id;
    }

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = value;
    }

    get resources(): Resource[] {
        return this._resources;
    }

    addResource(resource: Resource): void {
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
    ) { }

    get id(): number {
        return this._id;
    }

    get currentQuantity(): number {
        return this._currentQuantity;
    }

    set currentQuantity(value: number) {
        this._currentQuantity = value;
    }

    get expirationDate(): Date {
        return this._expirationDate;
    }

    set expirationDate(value: Date) {
        this._expirationDate = value;
    }

    get resources(): Resource[] {
        return this._resources;
    }

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
sale.addResource(resource);
console.log("Sale total:", sale.totalAmount());

console.log("\n=== ResourceGroup Management ===");
const resourceGroup = new ResourceGroup(1, 10, new Date('2024-12-31'));
resourceGroup.registerResource(resource);
console.log(resourceGroup);

console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());