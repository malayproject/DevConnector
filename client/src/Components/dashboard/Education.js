import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment'
import {deleteEducation} from '../../actions/profile'
import {connect} from 'react-redux'


const Education = ({ education, deleteEducation }) => {
    education = education?education:[]
    const educations = education.map(edu => (
        <tr key = {edu.id}>
            <td>{edu.school}</td>
            <td className = 'hide-sm'>{edu.degree}</td>
            <td>
                <Moment format = 'YYYY/MM/DD'>{edu.from}</Moment> - 
                {edu.to === null ? ('now') : (<Moment format='YYYY/MM/DD'>{edu.to}</Moment>)}
            </td>
            <td><button onClick = {() => deleteEducation(edu._id)} className = 'btn btn-danger'>delete</button></td>
        </tr>
    ))
    return (
        <Fragment>
            <h2 className="my-2">Education Credentials</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>School</th>
                        <th className="hide-sm">Degree</th>
                        <th className="hide-sm">Years</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{educations}</tbody>
            </table>
        </Fragment>
    )
}

Education.propTypes = {
    education : PropTypes.array.isRequired, 
    deleteEducation: PropTypes.func.isRequired,
}

export default connect(null, {deleteEducation})(Education)
