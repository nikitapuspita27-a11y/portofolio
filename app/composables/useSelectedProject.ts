// Proyek yang sedang dibuka di modal. Dipakai bersama oleh dunia 3D, kartu proyek, dan modal.
export const useSelectedProject = () => useState<string | null>('selected-project', () => null)
