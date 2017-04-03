export interface PointerMapEntry<T> {
    id: number;
    value: T;
}

export type PointerMap<T> = PointerMapEntry<T>[];
export type PointerMapList<T> = PointerMap<T[]>;

export function pointerMapSet<T>(map: PointerMap<T>, id: number, value: T) {
    for (let i = 0; i < map.length; i++) {
        const item = map[i];
        if (item.id === id) {
            item.value = value;
            return;
        }
    }
    map.push({ id, value });
}

export function pointerMapGet<T>(map: PointerMap<T>, id: number): T | undefined {
    for (let i = 0; i < map.length; i++) {
        const item = map[i];
        if (item.id === id) {
            return item.value;
        }
    }
    return undefined;
}

export function pointerMapDelete<T>(map: PointerMap<T>, id: number): void {
    for (let i = 0; i < map.length; i++) {
        const item = map[i];
        if (item.id === id) {
            if (i === map.length - 1) {
                map.pop()!;
            } else {
                map[i] = map.pop()!;
            }
            return;
        }
    }
}

export function pointerMapListPush<T>(map: PointerMapList<T>, id: number, value: T): void {
    for (let i = 0; i < map.length; i++) {
        const item = map[i];
        if (item.id === id) {
            item.value.push(value);
            return;
        }
    }
    map.push({
        id,
        value: [value],
    });
}

export function pointerMapListDelete<T>(map: PointerMapList<T>, id: number, value: T): void {
    for (let i = 0; i < map.length; i++) {
        const item = map[i];
        if (item.id === id) {
            const values = item.value;
            if (values.length === 1) {
                if (i === map.length - 1) {
                    map.pop()!;
                } else {
                    map[i] = map.pop()!;
                }
            } else {
                for (let j = 0; j < values.length; j++) {
                    const v = values[j];
                    if (v === value) {
                        if (j === values.length - 1) {
                            values.pop()!;
                        } else {
                            values[j] = values.pop()!;
                        }
                    }
                }
            }
            return;
        }
    }
}