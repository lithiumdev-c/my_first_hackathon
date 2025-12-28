import React from 'react'
import assets from '../assets/assets'

const Hero = () => {
  return (
    <div id='hero' className='flex flex-col items-center gap-6 py-20 px-4
    sm:px-12 lg:px-24 xl:px-40 text-center w-full overflow-hidden text-gray-700
    dark:text-white'>

        <h1 className='text-4xl sm:text-5xl md:text-6xl xl:text-[84px] font-medium
        xl:leading-[95px] max-w-5xl'>Делай мир чище - получай реальные <span className='bg-gradient-to-r from-[#145A32] to-[#27ae60]
        bg-clip-text text-transparent'>бонусы</span></h1>

        <p className='text-sm sm:text-lg font-medium text-gray-500 dark:text-white/75
        max-w-4/5 sm:max-w-lg pb-3'>Геймифицированная экосистема твоего города. Мы используем Computer Vision, чтобы мгновенно превращать твои экологические действия в цифровую валюту</p>
        
        <div className='relative'>
            <img src={assets.hero_img} className='w-full max-w-6xl' alt="" />
            <img src={assets.bgimg1} className='absolute -top-35 -right-40
            sm:-top-100 sm:-right-70 -z-1 dark:hidden' alt="" />
        </div>
    </div>
  )
}

export default Hero