import { Dialog, DialogPanel } from '@headlessui/react'

interface ModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
}

function Modal(props: ModalProps) {
  const { isOpen, setIsOpen } = props

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      transition
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0"
    >
      <DialogPanel className="max-w-lg bg-white rounded-lg">{props.children}</DialogPanel>
    </Dialog>
  )
}

export default Modal
