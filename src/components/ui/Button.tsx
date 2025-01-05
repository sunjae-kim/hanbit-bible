interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

const Button = ({ variant = 'primary', className = '', ...props }: Props) => {
  const styles = {
    primary:
      'rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    secondary:
      'rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
  }

  return (
    <button type="button" className={`${className} ${styles[variant]}`} {...props}>
      {props.children}
    </button>
  )
}

export default Button
