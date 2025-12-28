import React from 'react'
import assets from '../assets/assets'

const Footer = ({theme}) => {
  return (
    <div className='bg-slate-50 dark:bg-gray-900 pt-10 sm:pt-10 mt-20 sm:mt-40 px-4
    sm:px-10 lg:px-24 xl:px-40'>
        <div className='flex justify-between lg:items-center max-lg:flex-col gap-10'>
            <div className='space-y-5 text-sm text-gray-700
            dark:text-gray-400'>
                <img src={theme === "dark" ? assets.logo_dark : assets.logo} className='w-32 sm:w-44' alt="" />
                <p className='max-w-md'>Геймифицированная экосистема твоего города. Мы используем Computer Vision, чтобы мгновенно превращать твои экологические действия в цифровую валюту</p>
            
                <ul className='flex gap-8'>
                    <li><a className='hover:text-primary' href="#hero">Главная</a></li>
                    <li><a className='hover:text-primary' href="#services">Актуальность</a></li>
                    <li><a className='hover:text-primary' href="#features">Функционал</a></li>
                </ul>
            </div>
        </div>
        <hr className='border-gray-300 dark:border-gray-600 my-6'/>

        <div className='pb-6 text-sm text-gray-500 flex
        justify-center sm:justify-between gap-4 flex-wrap'>
            <p>Права защищены 2025 © ecocoin.ai - HackX hackathon</p>
        </div>
    </div>
  )
}

export default Footer