export type UserRole = 'admin' | 'manager' | 'kitchen' | 'investor' | 'customer'

export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    KITCHEN: 'kitchen',
    INVESTOR: 'investor',
    CUSTOMER: 'customer'
} as const

// Hardcoded Super Admin to prevent lockout during development
export const SUPER_ADMIN_EMAIL = 'olegvakin@gmail.com'

export interface UserProfile {
    uid: string
    email: string | null
    role: UserRole
    displayName?: string
}

/**
 * Checks if a user has permission to access a specific area
 */
export function canAccess(role: UserRole, path: string): boolean {
    // Super Admin / Admin has access to everything
    if (role === 'admin') return true

    // Manager: Everything except sensitive settings or user management (future)
    if (role === 'manager') {
        return path.startsWith('/admin') && !path.includes('/settings')
    }

    // Kitchen: Only orders
    if (role === 'kitchen') {
        return path.includes('/orders') || path === '/admin' // Allow dashboard root?
    }

    // Investor: Only analytics
    if (role === 'investor') {
        return path.includes('/analytics')
    }

    return false
}

/**
 * Simulates role retrieval. 
 * In production, this would fetch from Firestore 'users' collection or Custom Claims.
 * For now, we use the hardcoded check and default others to 'customer'.
 */
export async function getUserRole(email: string | null | undefined): Promise<UserRole> {
    if (!email) return 'customer'
    if (email === SUPER_ADMIN_EMAIL) return 'admin'

    // TODO: Fetch from Firestore if we have other staff
    return 'customer'
}
