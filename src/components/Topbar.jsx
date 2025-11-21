import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import usrImg from '../assets/usr.png'
import { useAuth } from '../context/AuthContext'
import SignInModal from './Auth/SignInModal'

const pathMeta = {
  '/': {
    title: 'Shop',
    subtitle: 'Shop > Books',
  },
  '/stores': {
    title: 'Stores',
    subtitle: 'Admin > Stores',
  },
  '/author': {
    title: 'Authors',
    subtitle: 'Admin > Authors',
  },
  '/books': {
    title: 'Books',
    subtitle: 'Admin > Books',
  },
  '/store/:storeId': {
    title: 'Store Inventory',
    subtitle: 'Admin > Store Inventory',
  },
  '/browsebooks': {
    title: 'Browse Books',
    subtitle: 'Shop > Books',
  },
  '/browseauthors': {
    title: 'Browse Authors',
    subtitle: 'Shop > Authors',
  },
}

const resolveMeta = (path) => {
  if (pathMeta[path]) return pathMeta[path]
  if (path.startsWith('/store/')) return pathMeta['/store/:storeId']
  return { title: 'Dashboard', subtitle: 'Welcome' }
}

const Topbar = () => {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const { title, subtitle } = useMemo(
    () => resolveMeta(location.pathname),
    [location.pathname]
  )

  return (
    <>
      <div className='h-24 border-b border-b-secondary-text flex justify-between items-center'>
        <div className='flex flex-col justify-start items-start'>
          <p className='text-lg text-secondary-text'>{title}</p>
          <p className='font-light text-secondary-text'>{subtitle}</p>
        </div>
        <div className='flex-1 flex justify-end items-center gap-3'>
          {isAuthenticated ? (
            <>
              <img src={usrImg} alt="profile" className='ml-4 rounded w-10 h-10 object-cover' />
              <div className='flex flex-col items-end'>
                <p className='text-secondary-text font-medium'>
                  {user?.name || 'User'}
                </p>
                <button
                  className='text-sm text-main underline'
                  onClick={signOut}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <button
              className='bg-main text-white px-4 py-2 rounded'
              onClick={() => setShowModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <SignInModal open={showModal && !isAuthenticated} onClose={() => setShowModal(false)} />
    </>
  )
}

export default Topbar