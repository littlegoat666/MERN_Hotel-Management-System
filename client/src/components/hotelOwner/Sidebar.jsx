import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    FileSpreadsheet,
    Plus,
    SlidersHorizontal,
    PencilLine,
    Trash2,
    Eye,
    Wrench,
} from 'lucide-react'

const sidebarSections = [
    {
        title: 'VIEW & DOWNLOAD',
        icon: Eye,
        items: [
            { name: 'Dashboard', path: '/owner', icon: LayoutDashboard, color: 'text-[#d97745]', background: 'bg-[#fff0e5]' },
            { name: 'Export & Reports', path: '/owner/export-reports', icon: FileSpreadsheet, color: 'text-[#9a6ab0]', background: 'bg-[#f4eafa]' },
        ],
    },
    {
        title: 'ROOM MANAGEMENT',
        icon: Wrench,
        items: [
            { name: 'Add Room', path: '/owner/add-room', icon: Plus, color: 'text-[#d58c32]', background: 'bg-[#fff2d9]' },
            { name: 'Set Room', path: '/owner/set-room', icon: SlidersHorizontal, color: 'text-[#478f91]', background: 'bg-[#e4f3f1]' },
            { name: 'Edit Room', path: '/owner/edit-room', icon: PencilLine, color: 'text-[#bd6c83]', background: 'bg-[#f9e8ed]' },
            { name: 'Delete Room', path: '/owner/delete-room', icon: Trash2, color: 'text-[#c45e53]', background: 'bg-[#fbe8e4]' },
        ],
    },
]

const Sidebar = () => {
    return (
        <aside className = 'flex min-h-full w-[68px] shrink-0 flex-col gap-4 border-r border-[#e9ded5] bg-[#faf7f3] px-2 pb-8 pt-5 transition-all duration-300 md:w-64 md:px-4 md:pt-6'>
            {sidebarSections.map((section) => {
                const SectionIcon = section.icon

                return (
                    <section key = {section.title} className = 'rounded-2xl border border-[#e9ded5] bg-[#fffdfa] p-2 shadow-sm md:p-3'>
                        <div className = 'mb-2 hidden items-center justify-between border-b border-[#f0e8e2] px-2 pb-3 md:flex'>
                            <div className = 'flex items-center gap-2'>
                                <SectionIcon size = {14} className = 'text-[#a77a63]' />
                                <p className = 'text-[10px] font-bold tracking-[0.13em] text-[#927f73]'>{section.title}</p>
                            </div>
                            <span className = 'text-[10px] text-[#b5a69b]'>{String(section.items.length).padStart(2, '0')}</span>
                        </div>

                        <nav className = 'flex flex-col gap-1.5'>
                            {section.items.map((item) => {
                                const Icon = item.icon

                                return (
                                    <NavLink
                                        to = {item.path}
                                        key = {item.path}
                                        end = {item.path === '/owner'}
                                        title = {item.name}
                                        className = {({ isActive }) => `group relative flex items-center justify-center gap-3 rounded-xl px-2 py-2.5 transition-all duration-200 md:justify-start md:px-3 ${isActive ? 'bg-[#f2e5dc] text-[#8f5946] shadow-sm' : 'text-[#786b61] hover:bg-[#f8f1eb] hover:text-[#8f5946]'}`}
                                    >
                                        <span className = {`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.background} ${item.color} transition-transform group-hover:scale-105`}>
                                            <Icon size = {19} strokeWidth = {2} />
                                        </span>
                                        <span className = 'hidden whitespace-nowrap text-sm font-medium md:block'>{item.name}</span>
                                    </NavLink>
                                )
                            })}
                        </nav>
                    </section>
                )
            })}
        </aside>
    )
}

export default Sidebar