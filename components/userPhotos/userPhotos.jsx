import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
// import FetchModel from '../lib/fetchModelData'; // Import the FetchModel function
//import FetchModel from '../../lib/fetchModelData';
import axios from 'axios';
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null,
      // eslint-disable-next-line react/no-unused-state
      version: null,
      // To store the version number
    };
  }

  componentDidMount() {
    this.fetchUserPhotos();
    this.fetchVersionInfo(); // Fetch version info on component mount
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { userId } = match.params;

    if (prevProps.match.params.userId !== userId) {
      this.fetchUserPhotos();
      console.log(userId);
    }
  }

  fetchUserPhotos() {
    const { match } = this.props;
    const { userId } = match.params;

    // Use the FetchModel function to get user photos
    axios.get(`/photosOfUser/${userId}`)
      .then((data) => {
        this.setState({ photos: data.data });
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });
  }

  fetchVersionInfo() {
    // Use the FetchModel function to get the version info
    axios.get('/test/info')
      .then((data) => {
        // eslint-disable-next-line react/no-unused-state
        this.setState({ version: data.data });
      })
      .catch((error) => {
        console.error('Error fetching version info:', error);
      });
  }

  render() {
    const { photos } = this.state;
    const { match } = this.props;
    const { userId } = match.params;

    return (
      <div>
        {photos ? (
          <div>
          <Button
            component={Link}
            to={`/users/${userId}`}
            variant="contained"
            color="primary"
            style={{ boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)' }}
          >
            User Details
          </Button>
          {/* {JSON.stringify(window.models.photoOfUserModel(this.props.match.params.userId)) */}
          
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo._id}
                style={{
                  margin: '10px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                  backgroundColor: '#fff',
                }}
              >
                <img
                  src={`/images/${photo.file_name}`}
                  alt={photo.file_name}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <p style={{ margin: 0 }}><b>Date Taken:</b> {photo.date_time}</p>

                {photo.comments && photo.comments.length > 0 && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                      backgroundColor: '#f5f5f5',
                      boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>
                    {photo.comments.map((comment) => (
                      <div
                        key={comment._id}
                        style={{
                          margin: '10px',
                          padding: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          backgroundColor: '#f9f9f9',
                          boxShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <p style={{ margin: 0 }}>{comment.comment}</p>
                        <p style={{ margin: 0, fontStyle: 'italic' }}>
                          <b>Commented ON:</b> {comment.date_time}
                        </p>
                        <p style={{ margin: 0, fontStyle: 'italic' }}>
                          <b>Commented BY:</b>
                          <Link to={`/users/${comment.user._id}`}>{comment.user.first_name} {comment.user.last_name}</Link>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        ) : (
          <p>No photos available</p>
        )}
      </div>
    );
  }
}
export default UserPhotos;