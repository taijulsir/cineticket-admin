export enum EmployeeRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  INVITED = "INVITED",
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeRole: EmployeeRole;
  status: EmployeeStatus;
  permissions: string[];
  createdAt: string;
  updatedAt?: string;
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InviteEmployeePayload {
  name: string;
  email: string;
  role: EmployeeRole;
}

export interface UpdateEmployeeRolePayload {
  role: EmployeeRole;
}

export interface UpdateEmployeeStatusPayload {
  status: EmployeeStatus;
}

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
}
