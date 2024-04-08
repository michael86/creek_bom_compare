import tableImage from '../assets/add_template.png'

const AddTemplateInfo = () => {
  return (
    <>
      <div className="add-template-info-container">
        <p>
          Add your templates here. Copy and paste your table headers and enter the respective column
          and row ids.
        </p>
        <img src={tableImage} />
      </div>
    </>
  )
}

export default AddTemplateInfo
