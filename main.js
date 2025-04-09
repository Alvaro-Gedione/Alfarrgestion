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
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.notifications = []; // Composição (1-*)
        this.tasks = []; // Agregação (*-*)
        this.events = []; // Agregação (*-*)
    }
    // Métodos para AppNotification (Composição 1-*)
    addNotification(message) {
        const notification = new AppNotification(this.notifications.length + 1, message, false, new Date(), this);
        this.notifications.push(notification);
        return notification;
    }
    // Métodos para Task (Agregação *-*)
    assignTask(task) {
        if (!this.tasks.some(t => t.id === task.id)) {
            this.tasks.push(task);
            task.assignUser(this);
        }
    }
    // Métodos para AppEvent (Agregação *-*)
    registerForEvent(event) {
        if (!this.events.some(e => e.id === event.id)) {
            this.events.push(event);
            event.addParticipant(this);
        }
    }
    authentication() {
        // Lógica de autenticação padrão para todos os usuários
        return this.email.endsWith("@empresa.com") && this.password.length > 6;
    }
    changePassword(newPassword) {
        this.password = newPassword;
    }
    updateProfile(updateData) {
        Object.assign(this, updateData);
    }
}
// ============= Classes Especializadas (Herança) =============
class Manager extends User {
    constructor(id, name, email, password, department) {
        super(id, name, email, password);
        this.department = department;
        this.employees = []; // Agregação (1-*)
    }
    // Métodos para Employee (Agregação 1-*)
    addEmployee(employee) {
        if (!this.employees.some(e => e.id === employee.id)) {
            this.employees.push(employee);
            employee.manager = this;
        }
    }
}
class Employee extends User {
    constructor(id, name, email, password, position, shift, manager // Agregação (*-1)
    ) {
        super(id, name, email, password);
        this.position = position;
        this.shift = shift;
        this.manager = manager;
    }
}
class Admin extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password);
        this.createdEvents = []; // Composição (1-*)
        this.generatedReports = []; // Associação (*-*)
    }
    // Métodos para AppEvent (Composição 1-*)
    createEvent(eventData) {
        const event = new AppEvent(this.createdEvents.length + 1, eventData.name, eventData.dateStart, eventData.dateFinish, eventData.description, eventData.location, this);
        this.createdEvents.push(event);
        return event;
    }
    // Métodos para Report (Associação *-*)
    generateReport(type, content) {
        const report = new CustomReport(this.generatedReports.length + 1, new Date(), type, content);
        this.generatedReports.push(report);
        return report;
    }
}
// ============= Classes de Domínio =============
class Task {
    constructor(id, description, timeLimit, conclusionTime = null, status = TaskStatus.Pending) {
        this.id = id;
        this.description = description;
        this.timeLimit = timeLimit;
        this.conclusionTime = conclusionTime;
        this.status = status;
        this.subTasks = []; // Auto-Agregação (*-*)
        this.assignedUsers = []; // Agregação (*-*)
        this.notifications = []; // Associação (*-*)
    }
    // Métodos para User (Agregação *-*)
    assignUser(user) {
        if (!this.assignedUsers.some(u => u.id === user.id)) {
            this.assignedUsers.push(user);
            user.assignTask(this);
        }
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications.push(notification);
        }
    }
    // Métodos para Task (Associação recursiva *-*)
    addSubTask(task) {
        if (!this.subTasks.some(t => t.id === task.id)) {
            this.subTasks.push(task);
        }
    }
    // Outros métodos
    updateStatus(newStatus) {
        this.status = newStatus;
        if (newStatus === TaskStatus.Completed) {
            this.conclusionTime = new Date();
        }
    }
    isFinished() {
        return this.status === TaskStatus.Completed;
    }
}
class AppEvent {
    constructor(id, name, dateStart, dateFinish, description, location, createdBy // Composição (*-1)
    ) {
        this.id = id;
        this.name = name;
        this.dateStart = dateStart;
        this.dateFinish = dateFinish;
        this.description = description;
        this.location = location;
        this.createdBy = createdBy;
        this.participants = []; // Agregação (*-*)
        this.notifications = []; // Associação (*-*)
    }
    // Métodos para User (Agregação *-*)
    addParticipant(user) {
        if (!this.participants.some(p => p.id === user.id)) {
            this.participants.push(user);
            user.registerForEvent(this);
        }
    }
    // Métodos para AppNotification (Associação *-*)
    addNotification(notification) {
        if (!this.notifications.some(n => n.id === notification.id)) {
            this.notifications.push(notification);
        }
    }
    // Outros métodos
    warning() {
        console.log(`AppEvent "${this.name}" is coming soon!`);
    }
}
class AppNotification {
    constructor(id, message, isRead, createdAt, recipient // Composição (*-1)
    ) {
        this.id = id;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.recipient = recipient;
    }
    markAsRead() {
        this.isRead = true;
    }
}
class CustomReport {
    constructor(id, date, type, content) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.content = content;
    }
    generateReport() {
        return this.content;
    }
}
class Resource {
    constructor(id, name, description, price, category, supplier) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.supplier = supplier;
    }
}
class Sale {
    constructor(id, date) {
        this.id = id;
        this.date = date;
        this.resources = []; // Composição (*-*)
    }
    Resource(resource) {
        this.resources.push(resource);
    }
    totalAmount() {
        return this.resources.reduce((sum, resource) => sum + resource.price, 0);
    }
}
class ResourceGroup {
    constructor(id, currentQuantity, expirationDate) {
        this.id = id;
        this.currentQuantity = currentQuantity;
        this.expirationDate = expirationDate;
        this.resources = []; // Composição (*-*)
    }
    registerResource(resource) {
        this.resources.push(resource);
    }
    updateResource(resourceId, updateData) {
        const resource = this.resources.find(p => p.id === resourceId);
        if (resource) {
            Object.assign(resource, updateData);
        }
    }
    deleteResource(resourceId) {
        this.resources = this.resources.filter(p => p.id !== resourceId);
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
