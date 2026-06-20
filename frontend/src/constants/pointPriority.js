export const POINT_PRIORITIES = {
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
};

export const PRIORITY_OPTIONS = [
  { value: POINT_PRIORITIES.URGENT, label: 'Срочный', color: '#EF4444' },
  { value: POINT_PRIORITIES.HIGH, label: 'Высокий', color: '#F59E0B' },
  { value: POINT_PRIORITIES.NORMAL, label: 'Обычный', color: '#6C63FF' },
];

export const PRIORITY_COLORS = {
    [POINT_PRIORITIES.NORMAL]: '#6C63FF',
    [POINT_PRIORITIES.HIGH]: '#F59E0B',
    [POINT_PRIORITIES.URGENT]: '#EF4444',
};

export function getPriorityColor(priority) {
    return PRIORITY_COLORS[priority] ?? PRIORITY_COLORS[POINT_PRIORITIES.NORMAL];
}

export function getPriorityLabel(priority) {
    return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? 'Обычный';
}
