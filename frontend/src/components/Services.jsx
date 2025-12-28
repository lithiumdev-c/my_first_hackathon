import React from 'react'
import assets from '../assets/assets'
import Title from './Title'
import ServiceCard from './ServiceCard'

const Services = () => {

    const servicesData = [
      {
        title: "Геймификация экологической ответственности",
        description: 'Мы решаем проблему отсутствия мотивации, конвертируя абстрактную заботу о природе в ощутимые бонусы и личную выгоду.',
        icon: assets.game,
      },
      {
        title: "Интеграция в «Умный город»",
        description: 'Использование AI и Computer Vision автоматизирует контроль эко-вклада, делая городскую среду технологичнее и прозрачнее.',
        icon: assets.city,
      },
      {
        title: "Новый канал экологического маркетинга",
        description: 'Платформа создает поток лояльных клиентов для локальных брендов через систему экологических вознаграждений.',
        icon: assets.bussiness,
      },
      {
        title: "Преодоление порога утилизации",
        description: 'Проект радикально повышает процент переработки отходов, превращая сортировку мусора в простую и массовую привычку жителей.',
        icon: assets.recycle,
      },
    ]

  return (
    <div id='services' className='relative flex flex-col items-center gap-7 px-4
    sm:px-12 lg:px-24 xl:px-40 pt-30 text-gray-700 dark:text-white'>
        <Title title='Актуальность нашего проекта' desc='EcoCoin современная экологическая платформа, которая превращает
        полезные экологические привычки в игру'/>

        <div className='flex flex-col md:grid grid-cols-2'>
            {servicesData.map((service, index) => (
                <ServiceCard key={index} service={service} index={index}/>
            ))}
        </div>

    </div>
  )
}

export default Services