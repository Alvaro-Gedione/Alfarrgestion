"use strict";
// ============= Enums =============
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Pending"] = "Pending";
    TaskStatus["InProgress"] = "In Progress";
    TaskStatus["Completed"] = "Completed";
})(TaskStatus || (TaskStatus = {}));
// ============= Classes Base =============
class User {
    constructor(_id, _name, _email, _password) {
        this._id = _id;
        this._name = _name;
        this._email = _email;
        this._password = _password;
        this._notifications = []; // Composição (1-*)
        this._tasks = []; // Agregação (*-*)
        this._events = []; // Agregação (*-*)
    }
    // Getters básicos
    get id() { return this._id; }
    get name() { return this._name; }
    get email() { return this._email; }
    // Métodos para AppNotification (Composição 1-*)
    addNotification(message) {
        const notification = new AppNotification(this._notifications.length + 1, message, false, new Date(), this);
        this._notifications.push(notification);
        return notification;
    }
    get notifications() {
        return [...this._notifications];
    }
    // Métodos para Task (Agregação *-*)
    assignTask(task) {
        if (!this._tasks.some(t => t.id === task.id)) {
            this._tasks.push(task);
            task.assignUser(this);
        }
    }
    get tasks() {
        return [...this._tasks];
    }
    // Métodos para AppEvent (Agregação *-*)
    registerForEvent(event) {
        if (!this._events.some(e => e.id === event.id)) {
            this._events.push(event);
            event.addParticipant(this);
        }
    }
    get events() {
        return [...this._events];
    }
    authentication() {
        // Lógica de autenticação padrão para todos os usuários
        return this.email.endsWith("@empresa.com") && this._password.length > 6;
    }
    changePassword(newPassword) {
        this._password = newPassword;
    }
    updateProfile(updateData) {
        Object.assign(this, updateData);
    }
}
// ============= Classes Especializadas (Herança) =============
class Manager extends User {
    constructor(id, name, email, password, _department) {
        super(id, name, email, password);
        this._department = _department;
        this._employees = []; // Agregação (1-*)
    }
    get department() { return this._department; }
    // Métodos para Employee (Agregação 1-*)
    addEmployee(employee) {
        if (!this._employees.some(e => e.id === employee.id)) {
            this._employees.push(employee);
            employee.manager = this;
        }
    }
    get employees() {
        return [...this._employees];
    }
}
class Employee extends User {
    constructor(id, name, email, password, _position, _shift, _manager // Agregação (*-1)
    ) {
        super(id, name, email, password);
        this._position = _position;
        this._shift = _shift;
        this._manager = _manager;
    }
    get manager() { return this._manager; }
    set manager(manager) { this._manager = manager; }
}
class Admin extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password);
        this._createdEvents = []; // Composição (1-*)
        this._generatedReports = []; // Associação (*-*)
    }
    // Métodos para AppEvent (Composição 1-*)
    createEvent(eventData) {
        const event = new AppEvent(this._createdEvents.length + 1, eventData.name, eventData.dateStart, eventData.dateFinish, eventData.description, eventData.location, this);
        this._createdEvents.push(event);
        return event;
    }
    get createdEvents() {
        return [...this._createdEvents];
    }
    // Métodos para Report (Associação *-*)
    generateReport(type, content) {
        const report = new CustomReport(this._generatedReports.length + 1, new Date(), type, content);
        this._generatedReports.push(report);
        return report;
    }
    get reports() {
        return [...this._generatedReports];
    }
}
// ============= Classes de Domínio =============
class Task {
    constructor(_id, _description, _timeLimit, _conclusionTime = null, _status = TaskStatus.Pending) {
        this._id = _id;
        this._description = _description;
        this._timeLimit = _timeLimit;
        this._conclusionTime = _conclusionTime;
        this._status = _status;
        this._subTasks = []; // Auto-Agregação (*-*)
        this._assignedUsers = []; // Agregação (*-*)
        this._notifications = []; // Associação (*-*)
    }
    // Getter for id
    get id() {
        return this._id;
    }
    // Métodos para User (Agregação *-*)
    assignUser(user) {
        if (!this._assignedUsers.some(u => u.id === user.id)) {
            this._assignedUsers.push(user);
            user.assignTask(this);
        }
    }
    get assignedUsers() {
        return [...this._assignedUsers];
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }
    get notifications() {
        return [...this._notifications];
    }
    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task) {
        if (!this._subTasks.some(t => t.id === task.id)) {
            this._subTasks.push(task);
        }
    }
    get subTasks() {
        return [...this._subTasks];
    }
    // Outros métodos
    updateStatus(newStatus) {
        this._status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this._conclusionTime = new Date();
        }
    }
    isFinished() {
        return this._status === TaskStatus.Completed;
    }
}
class AppEvent {
    constructor(_id, _name, _dateStart, _dateFinish, _description, _location, _createdBy // Composição (*-1)
    ) {
        this._id = _id;
        this._name = _name;
        this._dateStart = _dateStart;
        this._dateFinish = _dateFinish;
        this._description = _description;
        this._location = _location;
        this._createdBy = _createdBy;
        this._participants = []; // Agregação (*-*)
        this._notifications = []; // Associação (*-*)
    }
    // Getter for id
    get id() {
        return this._id;
    }
    // Métodos para User (Agregação *-*)
    addParticipant(user) {
        if (!this._participants.some(p => p.id === user.id)) {
            this._participants.push(user);
            user.registerForEvent(this);
        }
    }
    get participants() {
        return [...this._participants];
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }
    get notifications() {
        return [...this._notifications];
    }
    // Outros métodos
    warning() {
        console.log(`AppEvent "${this._name}" is coming soon!`);
    }
}
class AppNotification {
    constructor(_id, _message, _isRead, _createdAt, _recipient // Composição (*-1)
    ) {
        this._id = _id;
        this._message = _message;
        this._isRead = _isRead;
        this._createdAt = _createdAt;
        this._recipient = _recipient;
    }
    // Getter for id
    get id() {
        return this._id;
    }
    markAsRead() {
        this._isRead = true;
    }
}
class CustomReport {
    constructor(_id, _date, _type, _content) {
        this._id = _id;
        this._date = _date;
        this._type = _type;
        this._content = _content;
    }
    generateReport() {
        return this._content;
    }
}
class Resource {
    constructor(_id, _name, _description, _price, _category, _supplier) {
        this._id = _id;
        this._name = _name;
        this._description = _description;
        this._price = _price;
        this._category = _category;
        this._supplier = _supplier;
    }
    get id() {
        return this._id;
    }
    get price() {
        return this._price;
    }
}
class Sale {
    get resources() {
        return [...this._resources];
    }
    constructor(_id, _date) {
        this._id = _id;
        this._date = _date;
        this._resources = []; // Composição (*-*)
    }
    Resource(resource) {
        this._resources.push(resource);
    }
    totalAmount() {
        return this._resources.reduce((sum, resource) => sum + resource.price, 0);
    }
}
class ResourceGroup {
    constructor(_id, _currentQuantity, _expirationDate) {
        this._id = _id;
        this._currentQuantity = _currentQuantity;
        this._expirationDate = _expirationDate;
        this._resources = []; // Composição (*-*)
    }
    registerResource(resource) {
        this._resources.push(resource);
    }
    updateResource(resourceId, updateData) {
        const resource = this._resources.find(p => p.id === resourceId);
        if (resource) {
            Object.assign(resource, updateData);
        }
    }
    deleteResource(resourceId) {
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
