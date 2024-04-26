import React from 'react';
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, IconButton } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import { Link } from 'react-router-dom';
import './userPhotos.css';
import axios from 'axios'; // Import Axios
import TopBar from '../topBar/TopBar';

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      user: null,
      comment: null,
      new_comment: '',
      add_comment: false,
      current_photo_id: null,
      addedComment: "",
      likedMessage: ''
    };

    // Bind event handlers to the instance
    this.handleShowAddComment = this.handleShowAddComment.bind(this);
    this.handleNewCommentChange = this.handleNewCommentChange.bind(this);
    this.handleCancelAddComment = this.handleCancelAddComment.bind(this);
    this.handleSubmitAddComment = this.handleSubmitAddComment.bind(this);
  }

  componentDidMount() {
    this.fetchUserPhotosAndDetails();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { userId } = match.params;

    if (prevProps.match.params.userId !== userId) {
      this.fetchUserPhotosAndDetails();
    }
  }

  fetchUserPhotosAndDetails() {
    const { match } = this.props;
    const { userId } = match.params;

    // Use Axios to fetch user photos from the server
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch((error) => {
        console.error('Error fetching user photos:', error);
      });

    // Use Axios to fetch user details from the server
    axios.get(`/user/${userId}`)
      .then((response) => {
        this.setState({
          user: response.data,
          comment: response.data ? response.data.comment : null,
        });
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });
  }

  handleShowAddComment = (event) => {
    const photo_id = event.currentTarget.getAttribute('photo_id');
    this.setState({
      add_comment: true,
      current_photo_id: photo_id,
    });
  };

  renderAddCommentDialog() {
    return (
      <Dialog open={this.state.add_comment}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new comment for the photo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comment"
            multiline
            rows={4}
            fullWidth
            variant="standard"
            onChange={this.handleNewCommentChange}
            value={this.state.new_comment}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancelAddComment}>Cancel</Button>
          <Button onClick={this.handleSubmitAddComment}>Add</Button>
        </DialogActions>
      </Dialog>
    );
  }

  handleSubmitAddComment = (event) => {
    const { current_photo_id, new_comment } = this.state;
    event.preventDefault();
    let passObj = {};
    passObj.comment = this.state.addedComment;

    // Use Axios to send the new comment to the server
    axios.post(`/commentsOfPhoto/${current_photo_id}`, { comment: new_comment, sharing_list: this.state.photo.sharing_list })
      .then((res) => {
        console.log('Comment added to the database successfully');

        this.setState({
          add_comment: false,
          new_comment: '',
          current_photo_id: null,
          addedComment: ""
        });
        this.fetchUserPhotosAndDetails();
        const commentedPhotoDetails = this.state.photos.find(photo => photo._id === current_photo_id);
        let obj = {};
        obj.name = res.data.name;
        obj.user_id = res.data._id;
        obj.date_time = new Date().valueOf();
        obj.type = "Commented on photo";
        obj.commented_photo_author = res.data.name;
        obj.commented_photo_file_name = commentedPhotoDetails.file_name;
        axios.post('/newActivity', obj);
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
      });
  };

  handleLike = (photoId) => {
    const { photos, user } = this.state;
    const alreadyLiked = photos.some(photo => photo.likes && photo.likes.includes(user._id));

    if (alreadyLiked) {
      this.setState({ likedMessage: 'This photo has already been liked by a user!' });
      return;
    }

    axios.post(`/likePhoto/${photoId}`)
      .then((response) => {
        console.log(response);
        console.log('Photo liked successfully');

        this.fetchUserPhotosAndDetails();
        const likedPhotoDetails = this.state.photos.find(photo => photo._id === photoId);
        let obj = {};
        obj.name = response.data.name;
        obj.date_time = new Date().valueOf();
        obj.type = "Liked photo";
        obj.liked_photo_file_name = likedPhotoDetails.file_name;
        axios.post('/newActivity', obj);
      })
      .catch((error) => {
        console.error('Error liking photo:', error);
      });
  };

  handleUnlike = (photoId) => {
    axios.post(`/unlikePhoto/${photoId}`)
      .then((response) => {
        console.log(response);
        console.log('Photo unliked successfully');
        this.fetchUserPhotosAndDetails();
        const UnlikedPhotoDetails = this.state.photos.find(photo => photo._id === photoId);
        let obj = {};
        obj.name = response.data.name;
        obj.date_time = new Date().valueOf();
        obj.type = "Unliked photo";
        obj.Unliked_photo_file_name = UnlikedPhotoDetails.file_name;
        axios.post('/newActivity', obj);
      })
      .catch((error) => {
        console.error('Error unliking photo:', error);
      });
  };

  handleNewCommentChange = (event) => {
    this.setState({
      new_comment: event.target.value,
    });
  };

  handleCancelAddComment = () => {
    this.setState({
      add_comment: false,
      new_comment: '',
      current_photo_id: null,
    });
  };

  handleDeletePhoto = (photoId) => {
    axios.post(`/deletePhoto/${photoId}`)
      .then((result) => {
        console.log(result.data);
        this.fetchUserPhotosAndDetails();
        const deletecommentPhotoDetails = this.state.photos.find(photo => photo._id === photoId);
        let obj = {};
        obj.name = result.data.name;
        obj.date_time = new Date().valueOf();
        obj.type = "deleted photo";
        obj.deleted_photo_file_name = deletecommentPhotoDetails.file_name;
        axios.post('/newActivity', obj);
      })
      .catch((err) => {
        console.log(photoId);
        console.log(err);
      });
  };

  handleDeleteComment = (passObj, photo_id) => {
    let body = {};
    body.commentId = passObj._id;
    axios.post(`deleteComment/${photo_id}`, body)
      .then(result => {
        console.log(result);
        this.fetchUserPhotosAndDetails();
        const deletecommentPhotoDetails = this.state.photos.find(photo => photo._id === photo_id);
        let obj = {};
        obj.name = result.data.name;
        obj.date_time = new Date().valueOf();
        obj.type = "deleted comment";
        obj.deleted_comment_file_name = deletecommentPhotoDetails.file_name;
        axios.post('/newActivity', obj);
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const { photos, user, comment, likedMessage } = this.state;
    const { match } = this.props;
    const { userId } = match.params;
    const topNameValue = user ? `User photos for ${user.first_name} ${user.last_name}` : '';

    return (
      <div>
        <TopBar topName={topNameValue} user={user} />
        <Button
          component={Link}
          to={`/users/${userId}`}
          variant="contained"
          className="ButtonLink"
        >
          User Details
        </Button>
        <Typography
          variant="h4"
          className="UserPhotosHeader"
        >
          User Photos
        </Typography>
        <div className="photo-list">
          {photos.map((photo) => (
            <div key={photo._id} className="photo-item">
              <img
                src={`/images/${photo.file_name}`}
                className="photo-image"
              />
              <div>
                <IconButton
                  onClick={() => this.handleLike(photo._id)}
                  style={{
                    color: photo.likes && photo.likes.includes(userId) ? '#1976D2' : 'inherit',
                  }}
                >
                  <ThumbUpAltIcon />
                </IconButton>
                <IconButton
                  onClick={() => this.handleUnlike(photo._id)}
                  color={photo.likes && photo.likes.includes(userId) ? '#1976D2' : 'inherit'}
                >
                  <ThumbDownAltIcon />
                </IconButton>
                <span>{photo.likes ? photo.likes.length : 0} Likes </span>
                {photo.likes && photo.likes.length > 0 && (
                  <span style={{ marginLeft: '120px', color: '#1976D2' }}>
                    Liked successfully!
                  </span>
                )}
              </div>
              {photo.user_id === userId && (
                <Button onClick={() => { console.log(photo.file_name); this.handleDeletePhoto(photo._id); }}> Delete the Photo </Button>
              )}
              <div className="user-photo-box" style={{ marginTop: '16px' }}>
                <Typography variant="caption" className="user-photo-title">
                  Date Taken
                </Typography>
                <Typography variant="body1" className="user-photo-value">
                  {photo.date_time}
                </Typography>
              </div>
              {photo.comments && photo.comments.length > 0 && (
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Comments:</p>
                  {photo.comments.map((userComment) => (
                    <div key={userComment._id} className="user-photo-box" style={{ marginTop: '16px' }}>
                      <p>{userComment.comment}</p>
                      <p>
                        <b>Commented ON:</b> {userComment.date_time}
                      </p>
                      <p>
                        <b>Commented BY:</b>
                        <Link to={`/users/${userComment.user._id}`}>{userComment.user.first_name} {userComment.user.last_name}</Link>
                      </p>
                      {photo.user_id === userId && (
                        <Button onClick={() => { console.log(userComment); console.log(photo._id); this.handleDeleteComment(userComment, photo._id); }}> Delete the Comment </Button>
                      )}
                    </div>
                  ))}
                  <Button photo_id={photo._id} variant="contained" onClick={this.handleShowAddComment}>
                    Add Comment
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {user ? (
          <div>
            {comment && (
              <div className="user-photo-box" style={{ marginTop: '16px' }}>
                <Typography variant="caption" className="user-photo-title">
                  Comment
                </Typography>
                <Typography variant="body1" className="user-photo-value">
                  {comment}
                </Typography>
              </div>
            )}
          </div>
        ) : (
          <Typography variant="body1" className="user-detail-box loading-text">
            Loading user details...
          </Typography>
        )}
        {this.renderAddCommentDialog()}
        {likedMessage && (
          <div style={{ marginTop: '16px', color: 'green' }}>
            {likedMessage}
          </div>
        )}
      </div>
    );
  }
}

export default UserPhotos;
