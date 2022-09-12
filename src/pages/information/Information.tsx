import React from 'react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import Info from '../../components/information/Information'

const Information: React.FC = () => {
  return (
    <HeaderTemplate
      showLeftIcon={true}
      headerTitle='Information'
      showRightIcon={false}
    >
      <Info />
    </HeaderTemplate>
  )
}

export default Information
