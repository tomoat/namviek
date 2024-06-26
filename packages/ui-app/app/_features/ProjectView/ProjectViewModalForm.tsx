import { ProjectViewType } from '@prisma/client'
import { useProjectViewContext } from './context'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useProjectViewAdd } from './useProjectViewAdd'
import ProjectViewFilterByBoard from '../ProjectViewFilter/BoardFilter'
import ProjectViewFilterByList from '../ProjectViewFilter/ListFilter'
import ProjectViewFilterByCalendar from '../ProjectViewFilter/CalendarFilter'
import ProjectViewFilterByGoal from '../ProjectViewFilter/GoalFilter'
import ProjectViewFilterByTeam from '../ProjectViewFilter/TeamFilter'
import ProjectViewFilterByDashboard from '../ProjectViewFilter/DashboardFilter'
import { Loading } from '@shared/ui'

export default function ProjectViewModalForm({
  type,
  name,
  desc
}: {
  type: ProjectViewType
  name: string
  desc: string
}) {
  const { projectId } = useParams()
  const { setVisible, name: viewName, icon, setName, filter, customView, setCustomView } = useProjectViewContext()
  const [loading, setLoading] = useState(false)
  const { addProjectView } = useProjectViewAdd()

  const hideModal = () => {
    setTimeout(() => {
      setLoading(false)
      setVisible(false)
      setCustomView(false)
      setName('')
    }, 500)
  }

  const onAdd = () => {
    setLoading(true)
    addProjectView({
      icon,
      name: viewName || name,
      type,
      projectId,
      data: customView ? filter : undefined
    })
      .catch(err => {
        hideModal()
      })
      .finally(() => {
        hideModal()
        setTimeout(() => {
          setLoading(false)
        }, 200)
      })
  }

  return (
    <div className="min-h-[500px]">
      <Loading.Absolute enabled={loading} title='Creating view' className='rounded-md' />
      <ProjectViewFilterByBoard type={type} desc={desc} onAdd={onAdd} />
      <ProjectViewFilterByList type={type} desc={desc} onAdd={onAdd} />
      <ProjectViewFilterByCalendar type={type} desc={desc} onAdd={onAdd} />
      <ProjectViewFilterByGoal type={type} desc={desc} onAdd={onAdd} />
      <ProjectViewFilterByTeam type={type} desc={desc} onAdd={onAdd} />
      <ProjectViewFilterByDashboard type={type} desc={desc} onAdd={onAdd} />
    </div>
  )
}
