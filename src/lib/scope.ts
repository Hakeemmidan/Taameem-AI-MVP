import { obligationsOf } from '@/data/obligations';
import { tasksOf } from '@/data/work';
import type { Role } from '@/data/tenants';
import type { Employee, Obligation, Task } from '@/lib/types';

/**
 * What one person is allowed to see inside their institution.
 *
 * Most roles see the whole institution. A department head sees their own
 * department: the obligations it owns, plus the obligations behind the tasks
 * it has been given — otherwise a head whose department only executes work
 * would open an empty register and never know why the task exists.
 */
export const scopeTasks = (tenantId: string, role: Role, user: Employee): Task[] => {
  const all = tasksOf(tenantId);
  return role.can.ownDepartmentOnly ? all.filter((x) => x.dept === user.department) : all;
};

export const scopeObligations = (tenantId: string, role: Role, user: Employee): Obligation[] => {
  const all = obligationsOf(tenantId);
  if (!role.can.ownDepartmentOnly) return all;
  const behindMyTasks = new Set(scopeTasks(tenantId, role, user).map((x) => x.obligationId));
  return all.filter((o) => o.ownerDept === user.department || behindMyTasks.has(o.id));
};
