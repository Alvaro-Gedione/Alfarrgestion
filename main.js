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
        this._notifications = [];
        this._tasks = [];
        this._events = [];
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get email() {
        return this._email;
    }
    set email(value) {
        this._email = value;
    }
    get password() {
        return this._password;
    }
    set password(value) {
        this._password = value;
    }
    get notifications() {
        return this._notifications;
    }
    get tasks() {
        return this._tasks;
    }
    get events() {
        return this._events;
    }
    addNotification(message) {
        const notification = new AppNotification(this._notifications.length + 1, message, false, new Date(), this);
        this._notifications.push(notification);
        return notification;
    }
    assignTask(task) {
        if (!this._tasks.some(t => t.id === task.id)) {
            this._tasks.push(task);
            task.assignUser(this);
        }
    }
    registerForEvent(event) {
        if (!this._events.some(e => e.id === event.id)) {
            this._events.push(event);
            event.addParticipant(this);
        }
    }
    authentication() {
        return this._email.endsWith("@empresa.com") && this._password.length > 6;
    }
    changePassword(newPassword) {
        this._password = newPassword;
    }
    updateProfile(updateData) {
        Object.assign(this, updateData);
    }
}
class Manager extends User {
    constructor(id, name, email, password, _department) {
        super(id, name, email, password);
        this._department = _department;
        this._employees = [];
    }
    get department() {
        return this._department;
    }
    set department(value) {
        this._department = value;
    }
    get employees() {
        return this._employees;
    }
    addEmployee(employee) {
        if (!this._employees.some(e => e.id === employee.id)) {
            this._employees.push(employee);
            employee.manager = this;
        }
    }
}
class Employee extends User {
    constructor(id, name, email, password, _position, _shift, manager) {
        super(id, name, email, password);
        this._position = _position;
        this._shift = _shift;
        this._manager = manager;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    get shift() {
        return this._shift;
    }
    set shift(value) {
        this._shift = value;
    }
    get manager() {
        return this._manager;
    }
    set manager(value) {
        this._manager = value;
    }
}
class Admin extends User {
    constructor() {
        super(...arguments);
        this._createdEvents = [];
        this._generatedReports = [];
    }
    get createdEvents() {
        return this._createdEvents;
    }
    get generatedReports() {
        return this._generatedReports;
    }
    createEvent(eventData) {
        const event = new AppEvent(this._createdEvents.length + 1, eventData.name, eventData.dateStart, eventData.dateFinish, eventData.description, eventData.location, this);
        this._createdEvents.push(event);
        return event;
    }
    generateReport(type, content) {
        const report = new CustomReport(this._generatedReports.length + 1, new Date(), type, content);
        this._generatedReports.push(report);
        return report;
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
    get id() {
        return this._id;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get timeLimit() {
        return this._timeLimit;
    }
    set timeLimit(value) {
        this._timeLimit = value;
    }
    get conclusionTime() {
        return this._conclusionTime;
    }
    set conclusionTime(value) {
        this._conclusionTime = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    get subTasks() {
        return this._subTasks;
    }
    get assignedUsers() {
        return this._assignedUsers;
    }
    get notifications() {
        return this._notifications;
    }
    // Métodos para User (Agregação *-*)
    assignUser(user) {
        if (!this._assignedUsers.some(u => u.id === user.id)) {
            this._assignedUsers.push(user);
            user.assignTask(this);
        }
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
    }
    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task) {
        if (!this._subTasks.some(t => t.id === task.id)) {
            this._subTasks.push(task);
        }
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
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get dateStart() {
        return this._dateStart;
    }
    set dateStart(value) {
        this._dateStart = value;
    }
    get dateFinish() {
        return this._dateFinish;
    }
    set dateFinish(value) {
        this._dateFinish = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get location() {
        return this._location;
    }
    set location(value) {
        this._location = value;
    }
    get createdBy() {
        return this._createdBy;
    }
    get participants() {
        return this._participants;
    }
    get notifications() {
        return this._notifications;
    }
    // Métodos para User (Agregação *-*)
    addParticipant(user) {
        if (!this._participants.some(p => p.id === user.id)) {
            this._participants.push(user);
            user.registerForEvent(this);
        }
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this._notifications.some(n => n.id === notification.id)) {
            this._notifications.push(notification);
        }
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
    get id() {
        return this._id;
    }
    get message() {
        return this._message;
    }
    set message(value) {
        this._message = value;
    }
    get isRead() {
        return this._isRead;
    }
    set isRead(value) {
        this._isRead = value;
    }
    get createdAt() {
        return this._createdAt;
    }
    set createdAt(value) {
        this._createdAt = value;
    }
    get recipient() {
        return this._recipient;
    }
    set recipient(value) {
        this._recipient = value;
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
    get id() {
        return this._id;
    }
    get date() {
        return this._date;
    }
    set date(value) {
        this._date = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
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
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get description() {
        return this._description;
    }
    set description(value) {
        this._description = value;
    }
    get price() {
        return this._price;
    }
    set price(value) {
        this._price = value;
    }
    get category() {
        return this._category;
    }
    set category(value) {
        this._category = value;
    }
    get supplier() {
        return this._supplier;
    }
    set supplier(value) {
        this._supplier = value;
    }
}
class Sale {
    constructor(_id, _date) {
        this._id = _id;
        this._date = _date;
        this._resources = []; // Composição (*-*)
    }
    get id() {
        return this._id;
    }
    get date() {
        return this._date;
    }
    set date(value) {
        this._date = value;
    }
    get resources() {
        return this._resources;
    }
    addResource(resource) {
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
    get id() {
        return this._id;
    }
    get currentQuantity() {
        return this._currentQuantity;
    }
    set currentQuantity(value) {
        this._currentQuantity = value;
    }
    get expirationDate() {
        return this._expirationDate;
    }
    set expirationDate(value) {
        this._expirationDate = value;
    }
    get resources() {
        return this._resources;
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
sale.addResource(resource);
console.log("Sale total:", sale.totalAmount());
console.log("\n=== ResourceGroup Management ===");
const resourceGroup = new ResourceGroup(1, 10, new Date('2024-12-31'));
resourceGroup.registerResource(resource);
console.log(resourceGroup);
console.log("\n=== Report Generation ===");
const report = new CustomReport(1, new Date(), "Sales", "Monthly sales report");
console.log(report.generateReport());
