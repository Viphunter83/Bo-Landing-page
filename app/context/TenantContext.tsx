'use client'

import React, { createContext, useContext } from 'react'
import { TenantConfig } from '../lib/config/tenant'

const TenantContext = createContext<TenantConfig | null>(null)

export function TenantProvider({ 
    config, 
    children 
}: { 
    config: TenantConfig
    children: React.ReactNode 
}) {
    return (
        <TenantContext.Provider value={config}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider')
    }
    return context
}
