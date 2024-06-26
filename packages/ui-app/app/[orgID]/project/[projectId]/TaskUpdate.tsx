import { Modal, messageError, messageSuccess } from '@shared/ui'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import TaskForm, { ITaskDefaultValues, defaultFormikValues } from './TaskForm'
import { useTaskStore } from '@/store/task'
import { useUser } from '@goalie/nextjs'
import { taskUpdate } from '@/services/task'
import { Task } from '@prisma/client'
import { useTaskAutomation } from '@/hooks/useTaskAutomation'
import FileKitContainer from '@/components/FileKits'
import TaskDetail from '@/features/TaskDetail'

function TestModal({ visible, setVisible }: { visible: boolean, setVisible: () => void }) {
  const classes = 'fixed flex items-center justify-center top-0 left-0 w-full h-full z-50 backdrop-blur-md'

  return <div className={`${classes} ${visible ? '' : 'invisible pointer-events-none'}`}>
    <div className='w-[500px] border rounded-md bg-black p-8'>
      <h2>Hello world</h2>
      <span onClick={setVisible} className='px-3 py-2 rounded-md border bg-gray-500'>Close me</span>
    </div>
  </div>
}

export const TaskUpdate = () => {
  const [visible, setVisible] = useState(false)
  const sp = useSearchParams()
  const { syncRemoteTaskById, tasks, taskLoading, updateTask } = useTaskStore()

  const { refactorTaskFieldByAutomationConfig } = useTaskAutomation()

  const [currentTask, setCurrentTask] =
    useState<ITaskDefaultValues>(defaultFormikValues)
  const refCurrentTask = useRef<Task>()
  const { user } = useUser()
  const { orgID, projectId } = useParams()
  const router = useRouter()
  const mode = sp.get('mode')
  const taskId = sp.get('taskId')

  useEffect(() => {
    console.log('taskId', taskId)
    if (!taskId) return

    setVisible(true)
  }, [taskId])

  const closeTheModal = () => {
    setVisible(false)
    router.replace(`${orgID}/project/${projectId}?mode=${mode}`)
  }

  const handleSubmit = (v: ITaskDefaultValues) => {
    if (!taskId) return

    const dataUpdate = {
      ...v,
      id: taskId,
      updatedBy: user?.id,
      updatedAt: new Date()
    }

    updateTask(dataUpdate)
    closeTheModal()
    refactorTaskFieldByAutomationConfig('task', dataUpdate)

    // clear fileIds cuz we've updated fileIds already
    // see <FileUpload /> component
    dataUpdate.fileIds = []

    taskUpdate(dataUpdate)
      .then(res => {
        const { data, status } = res.data
        if (status !== 200) return

        messageSuccess('Synced success !')
        syncRemoteTaskById(data.id, data as Task)
      })
      .catch(err => {
        messageError('Update new task error')

        if (!refCurrentTask.current) return
        // syncRemoteTaskById(refCurrentTask.current.id, refCurrentTask.current)
        console.log(err)
      })
      .finally(() => {
        // setVisible(false)
        // router.replace(`${orgID}/project/${projectId}?mode=${mode}`)
      })
  }

  // When copy the url with taskId param and paste to another tab
  // The form will be rendered first, the defaultValue updated later
  // Thus, we need to make sure that the defaultValue update first
  // That's why we use useLayoutEffect here
  // It block render process and only run when the inside code run already
  useLayoutEffect(() => {
    if (!taskId || !tasks || !tasks.length) return
    const currentTask = tasks.find(task => task.id === taskId)
    refCurrentTask.current = currentTask

    if (currentTask) {
      setCurrentTask({
        title: currentTask?.title || defaultFormikValues.title,
        type: currentTask.type || defaultFormikValues.type,
        fileIds: currentTask.fileIds || [],
        cover: currentTask.cover || '',
        taskStatusId:
          currentTask?.taskStatusId || defaultFormikValues.taskStatusId,
        priority: currentTask.priority
          ? currentTask.priority
          : defaultFormikValues.priority,
        dueDate: currentTask.dueDate
          ? new Date(currentTask.dueDate)
          : defaultFormikValues.dueDate,
        plannedDueDate: currentTask.plannedDueDate
          ? new Date(currentTask.plannedDueDate)
          : defaultFormikValues.plannedDueDate,
        planedStartDate: currentTask.plannedStartDate
          ? new Date(currentTask.plannedStartDate)
          : defaultFormikValues.planedStartDate,
        assigneeIds: currentTask.assigneeIds
          ? currentTask.assigneeIds
          : defaultFormikValues.assigneeIds,
        desc: currentTask.desc ? currentTask.desc : defaultFormikValues.desc,
        progress: currentTask.progress
          ? currentTask.progress
          : defaultFormikValues.progress
      })
    }
  }, [taskId, tasks])

  console.log('task update form visible:', visible)

  return (
    <>
      <TestModal visible={visible} setVisible={() => {
        setVisible(false)
      }} />
      {/* <div> */}
      {/*   <Modal */}
      {/*     size="lg" */}
      {/*     visible={visible} */}
      {/*     onVisibleChange={() => { */}
      {/*       setVisible(false) */}
      {/*       router.replace(`${orgID}/project/${projectId}?mode=${mode}`) */}
      {/*     }} */}
      {/*     loading={taskLoading} */}
      {/*     title="" */}
      {/*     content={ */}
      {/*       <> */}
      {/*         <FileKitContainer fileIds={currentTask.fileIds}> */}
      {/*           <TaskDetail */}
      {/*             id={taskId || ''} */}
      {/*             cover={currentTask.cover || ''} */}
      {/*             defaultValue={currentTask} */}
      {/*             onSubmit={v => handleSubmit(v)} */}
      {/*           /> */}
      {/*         </FileKitContainer> */}
      {/*       </> */}
      {/*     } */}
      {/*   /> */}
      {/* </div> */}
    </>
  )
}
