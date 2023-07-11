// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        v3.21.12
// source: authentication.proto

package protos

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// The validation function that checks if the user has the required permission over the project
type ValidationRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Jwt           string   `protobuf:"bytes,1,opt,name=jwt,proto3" json:"jwt,omitempty"`
	ProjectId     string   `protobuf:"bytes,2,opt,name=projectId,proto3" json:"projectId,omitempty"`
	RequiredRoles []string `protobuf:"bytes,3,rep,name=requiredRoles,proto3" json:"requiredRoles,omitempty"`
	Invitation    string   `protobuf:"bytes,4,opt,name=invitation,proto3" json:"invitation,omitempty"`
}

func (x *ValidationRequest) Reset() {
	*x = ValidationRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ValidationRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ValidationRequest) ProtoMessage() {}

func (x *ValidationRequest) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ValidationRequest.ProtoReflect.Descriptor instead.
func (*ValidationRequest) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{0}
}

func (x *ValidationRequest) GetJwt() string {
	if x != nil {
		return x.Jwt
	}
	return ""
}

func (x *ValidationRequest) GetProjectId() string {
	if x != nil {
		return x.ProjectId
	}
	return ""
}

func (x *ValidationRequest) GetRequiredRoles() []string {
	if x != nil {
		return x.RequiredRoles
	}
	return nil
}

func (x *ValidationRequest) GetInvitation() string {
	if x != nil {
		return x.Invitation
	}
	return ""
}

// The validation response that will contain the results of the validation request
type ValidationResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Error   string `protobuf:"bytes,1,opt,name=error,proto3" json:"error,omitempty"`
	IsValid bool   `protobuf:"varint,2,opt,name=isValid,proto3" json:"isValid,omitempty"`
}

func (x *ValidationResponse) Reset() {
	*x = ValidationResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ValidationResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ValidationResponse) ProtoMessage() {}

func (x *ValidationResponse) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ValidationResponse.ProtoReflect.Descriptor instead.
func (*ValidationResponse) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{1}
}

func (x *ValidationResponse) GetError() string {
	if x != nil {
		return x.Error
	}
	return ""
}

func (x *ValidationResponse) GetIsValid() bool {
	if x != nil {
		return x.IsValid
	}
	return false
}

// GetProjectByIdRequest is the message struct for requesting project details by ID
type GetProjectByIdRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ProjectID string `protobuf:"bytes,1,opt,name=projectID,proto3" json:"projectID,omitempty"`
}

func (x *GetProjectByIdRequest) Reset() {
	*x = GetProjectByIdRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetProjectByIdRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetProjectByIdRequest) ProtoMessage() {}

func (x *GetProjectByIdRequest) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetProjectByIdRequest.ProtoReflect.Descriptor instead.
func (*GetProjectByIdRequest) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{2}
}

func (x *GetProjectByIdRequest) GetProjectID() string {
	if x != nil {
		return x.ProjectID
	}
	return ""
}

//ProjectMembers is the message struct that holds the details about the project members
type ProjectMembers struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Uid        string `protobuf:"bytes,1,opt,name=uid,proto3" json:"uid,omitempty"`
	Username   string `protobuf:"bytes,2,opt,name=userName,proto3" json:"userName,omitempty"`
	Role       string `protobuf:"bytes,3,opt,name=role,proto3" json:"role,omitempty"`
	Email      string `protobuf:"bytes,4,opt,name=email,proto3" json:"email,omitempty"`
	Invitation string `protobuf:"bytes,5,opt,name=invitation,proto3" json:"invitation,omitempty"`
	JoinedAt   string `protobuf:"bytes,6,opt,name=joinedAt,proto3" json:"joinedAt,omitempty"`
}

func (x *ProjectMembers) Reset() {
	*x = ProjectMembers{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ProjectMembers) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ProjectMembers) ProtoMessage() {}

func (x *ProjectMembers) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ProjectMembers.ProtoReflect.Descriptor instead.
func (*ProjectMembers) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{3}
}

func (x *ProjectMembers) GetUid() string {
	if x != nil {
		return x.Uid
	}
	return ""
}

func (x *ProjectMembers) GetUsername() string {
	if x != nil {
		return x.Username
	}
	return ""
}

func (x *ProjectMembers) GetRole() string {
	if x != nil {
		return x.Role
	}
	return ""
}

func (x *ProjectMembers) GetEmail() string {
	if x != nil {
		return x.Email
	}
	return ""
}

func (x *ProjectMembers) GetInvitation() string {
	if x != nil {
		return x.Invitation
	}
	return ""
}

func (x *ProjectMembers) GetJoinedAt() string {
	if x != nil {
		return x.JoinedAt
	}
	return ""
}

// GetProjectByIdRequest is the message struct for response of project details by ID
type GetProjectByIdResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id        string            `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Uid       string            `protobuf:"bytes,2,opt,name=uid,proto3" json:"uid,omitempty"`
	Name      string            `protobuf:"bytes,3,opt,name=name,proto3" json:"name,omitempty"`
	Members   []*ProjectMembers `protobuf:"bytes,4,rep,name=members,proto3" json:"members,omitempty"`
	State     string            `protobuf:"bytes,5,opt,name=state,proto3" json:"state,omitempty"`
	CreatedAt string            `protobuf:"bytes,6,opt,name=createdAt,proto3" json:"createdAt,omitempty"`
	UpdatedAt string            `protobuf:"bytes,7,opt,name=updatedAt,proto3" json:"updatedAt,omitempty"`
	RemovedAt string            `protobuf:"bytes,8,opt,name=removedAt,proto3" json:"removedAt,omitempty"`
}

func (x *GetProjectByIdResponse) Reset() {
	*x = GetProjectByIdResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetProjectByIdResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetProjectByIdResponse) ProtoMessage() {}

func (x *GetProjectByIdResponse) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetProjectByIdResponse.ProtoReflect.Descriptor instead.
func (*GetProjectByIdResponse) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{4}
}

func (x *GetProjectByIdResponse) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *GetProjectByIdResponse) GetUid() string {
	if x != nil {
		return x.Uid
	}
	return ""
}

func (x *GetProjectByIdResponse) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *GetProjectByIdResponse) GetMembers() []*ProjectMembers {
	if x != nil {
		return x.Members
	}
	return nil
}

func (x *GetProjectByIdResponse) GetState() string {
	if x != nil {
		return x.State
	}
	return ""
}

func (x *GetProjectByIdResponse) GetCreatedAt() string {
	if x != nil {
		return x.CreatedAt
	}
	return ""
}

func (x *GetProjectByIdResponse) GetUpdatedAt() string {
	if x != nil {
		return x.UpdatedAt
	}
	return ""
}

func (x *GetProjectByIdResponse) GetRemovedAt() string {
	if x != nil {
		return x.RemovedAt
	}
	return ""
}

// GetUserByIdRequest is the message struct for requesting user details by ID
type GetUserByIdRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UserID string `protobuf:"bytes,1,opt,name=userID,proto3" json:"userID,omitempty"`
}

func (x *GetUserByIdRequest) Reset() {
	*x = GetUserByIdRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetUserByIdRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetUserByIdRequest) ProtoMessage() {}

func (x *GetUserByIdRequest) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetUserByIdRequest.ProtoReflect.Descriptor instead.
func (*GetUserByIdRequest) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{5}
}

func (x *GetUserByIdRequest) GetUserID() string {
	if x != nil {
		return x.UserID
	}
	return ""
}

// GetUserByIdResponse is the message struct for response of user details by ID
type GetUserByIdResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id            string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Username      string `protobuf:"bytes,2,opt,name=username,proto3" json:"username,omitempty"`
	Email         string `protobuf:"bytes,3,opt,name=email,proto3" json:"email,omitempty"`
	Role          string `protobuf:"bytes,4,opt,name=role,proto3" json:"role,omitempty"`
	Name          string `protobuf:"bytes,5,opt,name=name,proto3" json:"name,omitempty"`
	CreatedAt     string `protobuf:"bytes,6,opt,name=createdAt,proto3" json:"createdAt,omitempty"`
	UpdatedAt     string `protobuf:"bytes,7,opt,name=updatedAt,proto3" json:"updatedAt,omitempty"`
	DeactivatedAt string `protobuf:"bytes,8,opt,name=deactivatedAt,proto3" json:"deactivatedAt,omitempty"`
}

func (x *GetUserByIdResponse) Reset() {
	*x = GetUserByIdResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_authentication_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetUserByIdResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetUserByIdResponse) ProtoMessage() {}

func (x *GetUserByIdResponse) ProtoReflect() protoreflect.Message {
	mi := &file_authentication_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetUserByIdResponse.ProtoReflect.Descriptor instead.
func (*GetUserByIdResponse) Descriptor() ([]byte, []int) {
	return file_authentication_proto_rawDescGZIP(), []int{6}
}

func (x *GetUserByIdResponse) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *GetUserByIdResponse) GetUsername() string {
	if x != nil {
		return x.Username
	}
	return ""
}

func (x *GetUserByIdResponse) GetEmail() string {
	if x != nil {
		return x.Email
	}
	return ""
}

func (x *GetUserByIdResponse) GetRole() string {
	if x != nil {
		return x.Role
	}
	return ""
}

func (x *GetUserByIdResponse) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *GetUserByIdResponse) GetCreatedAt() string {
	if x != nil {
		return x.CreatedAt
	}
	return ""
}

func (x *GetUserByIdResponse) GetUpdatedAt() string {
	if x != nil {
		return x.UpdatedAt
	}
	return ""
}

func (x *GetUserByIdResponse) GetDeactivatedAt() string {
	if x != nil {
		return x.DeactivatedAt
	}
	return ""
}

var File_authentication_proto protoreflect.FileDescriptor

var file_authentication_proto_rawDesc = []byte{
	0x0a, 0x14, 0x61, 0x75, 0x74, 0x68, 0x65, 0x6e, 0x74, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x22, 0x89,
	0x01, 0x0a, 0x11, 0x56, 0x61, 0x6c, 0x69, 0x64, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x12, 0x10, 0x0a, 0x03, 0x6a, 0x77, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x03, 0x6a, 0x77, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x70, 0x72, 0x6f, 0x6a, 0x65, 0x63,
	0x74, 0x49, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x70, 0x72, 0x6f, 0x6a, 0x65,
	0x63, 0x74, 0x49, 0x64, 0x12, 0x24, 0x0a, 0x0d, 0x72, 0x65, 0x71, 0x75, 0x69, 0x72, 0x65, 0x64,
	0x52, 0x6f, 0x6c, 0x65, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x09, 0x52, 0x0d, 0x72, 0x65, 0x71,
	0x75, 0x69, 0x72, 0x65, 0x64, 0x52, 0x6f, 0x6c, 0x65, 0x73, 0x12, 0x1e, 0x0a, 0x0a, 0x69, 0x6e,
	0x76, 0x69, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0a,
	0x69, 0x6e, 0x76, 0x69, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x22, 0x44, 0x0a, 0x12, 0x56, 0x61,
	0x6c, 0x69, 0x64, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65,
	0x12, 0x14, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x12, 0x18, 0x0a, 0x07, 0x69, 0x73, 0x56, 0x61, 0x6c, 0x69,
	0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x08, 0x52, 0x07, 0x69, 0x73, 0x56, 0x61, 0x6c, 0x69, 0x64,
	0x22, 0x35, 0x0a, 0x15, 0x47, 0x65, 0x74, 0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x42, 0x79,
	0x49, 0x64, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x70, 0x72, 0x6f,
	0x6a, 0x65, 0x63, 0x74, 0x49, 0x44, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x70, 0x72,
	0x6f, 0x6a, 0x65, 0x63, 0x74, 0x49, 0x44, 0x22, 0xa4, 0x01, 0x0a, 0x0e, 0x50, 0x72, 0x6f, 0x6a,
	0x65, 0x63, 0x74, 0x4d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x12, 0x10, 0x0a, 0x03, 0x75, 0x69,
	0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x69, 0x64, 0x12, 0x1a, 0x0a, 0x08,
	0x75, 0x73, 0x65, 0x72, 0x4e, 0x61, 0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08,
	0x75, 0x73, 0x65, 0x72, 0x4e, 0x61, 0x6d, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x72, 0x6f, 0x6c, 0x65,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x72, 0x6f, 0x6c, 0x65, 0x12, 0x14, 0x0a, 0x05,
	0x65, 0x6d, 0x61, 0x69, 0x6c, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x65, 0x6d, 0x61,
	0x69, 0x6c, 0x12, 0x1e, 0x0a, 0x0a, 0x69, 0x6e, 0x76, 0x69, 0x74, 0x61, 0x74, 0x69, 0x6f, 0x6e,
	0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0a, 0x69, 0x6e, 0x76, 0x69, 0x74, 0x61, 0x74, 0x69,
	0x6f, 0x6e, 0x12, 0x1a, 0x0a, 0x08, 0x6a, 0x6f, 0x69, 0x6e, 0x65, 0x64, 0x41, 0x74, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x6a, 0x6f, 0x69, 0x6e, 0x65, 0x64, 0x41, 0x74, 0x22, 0xf0,
	0x01, 0x0a, 0x16, 0x47, 0x65, 0x74, 0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x42, 0x79, 0x49,
	0x64, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x10, 0x0a, 0x03, 0x75, 0x69, 0x64,
	0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x69, 0x64, 0x12, 0x12, 0x0a, 0x04, 0x6e,
	0x61, 0x6d, 0x65, 0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12,
	0x30, 0x0a, 0x07, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x18, 0x04, 0x20, 0x03, 0x28, 0x0b,
	0x32, 0x16, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63,
	0x74, 0x4d, 0x65, 0x6d, 0x62, 0x65, 0x72, 0x73, 0x52, 0x07, 0x6d, 0x65, 0x6d, 0x62, 0x65, 0x72,
	0x73, 0x12, 0x14, 0x0a, 0x05, 0x73, 0x74, 0x61, 0x74, 0x65, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x05, 0x73, 0x74, 0x61, 0x74, 0x65, 0x12, 0x1c, 0x0a, 0x09, 0x63, 0x72, 0x65, 0x61, 0x74,
	0x65, 0x64, 0x41, 0x74, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x63, 0x72, 0x65, 0x61,
	0x74, 0x65, 0x64, 0x41, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64,
	0x41, 0x74, 0x18, 0x07, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65,
	0x64, 0x41, 0x74, 0x12, 0x1c, 0x0a, 0x09, 0x72, 0x65, 0x6d, 0x6f, 0x76, 0x65, 0x64, 0x41, 0x74,
	0x18, 0x08, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x72, 0x65, 0x6d, 0x6f, 0x76, 0x65, 0x64, 0x41,
	0x74, 0x22, 0x2c, 0x0a, 0x12, 0x47, 0x65, 0x74, 0x55, 0x73, 0x65, 0x72, 0x42, 0x79, 0x49, 0x64,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x16, 0x0a, 0x06, 0x75, 0x73, 0x65, 0x72, 0x49,
	0x44, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x75, 0x73, 0x65, 0x72, 0x49, 0x44, 0x22,
	0xe1, 0x01, 0x0a, 0x13, 0x47, 0x65, 0x74, 0x55, 0x73, 0x65, 0x72, 0x42, 0x79, 0x49, 0x64, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x1a, 0x0a, 0x08, 0x75, 0x73, 0x65, 0x72, 0x6e,
	0x61, 0x6d, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x75, 0x73, 0x65, 0x72, 0x6e,
	0x61, 0x6d, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x65, 0x6d, 0x61, 0x69, 0x6c, 0x18, 0x03, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x05, 0x65, 0x6d, 0x61, 0x69, 0x6c, 0x12, 0x12, 0x0a, 0x04, 0x72, 0x6f, 0x6c,
	0x65, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x72, 0x6f, 0x6c, 0x65, 0x12, 0x12, 0x0a,
	0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d,
	0x65, 0x12, 0x1c, 0x0a, 0x09, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x63, 0x72, 0x65, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x12,
	0x1c, 0x0a, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x18, 0x07, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x09, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x12, 0x24, 0x0a,
	0x0d, 0x64, 0x65, 0x61, 0x63, 0x74, 0x69, 0x76, 0x61, 0x74, 0x65, 0x64, 0x41, 0x74, 0x18, 0x08,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x64, 0x65, 0x61, 0x63, 0x74, 0x69, 0x76, 0x61, 0x74, 0x65,
	0x64, 0x41, 0x74, 0x32, 0xf9, 0x01, 0x0a, 0x0e, 0x61, 0x75, 0x74, 0x68, 0x52, 0x70, 0x63, 0x53,
	0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x4a, 0x0a, 0x0f, 0x56, 0x61, 0x6c, 0x69, 0x64, 0x61,
	0x74, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x19, 0x2e, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x73, 0x2e, 0x56, 0x61, 0x6c, 0x69, 0x64, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x1a, 0x1a, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x56, 0x61,
	0x6c, 0x69, 0x64, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65,
	0x22, 0x00, 0x12, 0x51, 0x0a, 0x0e, 0x47, 0x65, 0x74, 0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74,
	0x42, 0x79, 0x49, 0x64, 0x12, 0x1d, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x47, 0x65,
	0x74, 0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x42, 0x79, 0x49, 0x64, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x1a, 0x1e, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x47, 0x65, 0x74,
	0x50, 0x72, 0x6f, 0x6a, 0x65, 0x63, 0x74, 0x42, 0x79, 0x49, 0x64, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x22, 0x00, 0x12, 0x48, 0x0a, 0x0b, 0x47, 0x65, 0x74, 0x55, 0x73, 0x65, 0x72,
	0x42, 0x79, 0x49, 0x64, 0x12, 0x1a, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x47, 0x65,
	0x74, 0x55, 0x73, 0x65, 0x72, 0x42, 0x79, 0x49, 0x64, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x1b, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x2e, 0x47, 0x65, 0x74, 0x55, 0x73, 0x65,
	0x72, 0x42, 0x79, 0x49, 0x64, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x22, 0x00, 0x42,
	0x0a, 0x5a, 0x08, 0x2e, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x33,
}

var (
	file_authentication_proto_rawDescOnce sync.Once
	file_authentication_proto_rawDescData = file_authentication_proto_rawDesc
)

func file_authentication_proto_rawDescGZIP() []byte {
	file_authentication_proto_rawDescOnce.Do(func() {
		file_authentication_proto_rawDescData = protoimpl.X.CompressGZIP(file_authentication_proto_rawDescData)
	})
	return file_authentication_proto_rawDescData
}

var file_authentication_proto_msgTypes = make([]protoimpl.MessageInfo, 7)
var file_authentication_proto_goTypes = []interface{}{
	(*ValidationRequest)(nil),      // 0: protos.ValidationRequest
	(*ValidationResponse)(nil),     // 1: protos.ValidationResponse
	(*GetProjectByIdRequest)(nil),  // 2: protos.GetProjectByIdRequest
	(*ProjectMembers)(nil),         // 3: protos.ProjectMembers
	(*GetProjectByIdResponse)(nil), // 4: protos.GetProjectByIdResponse
	(*GetUserByIdRequest)(nil),     // 5: protos.GetUserByIdRequest
	(*GetUserByIdResponse)(nil),    // 6: protos.GetUserByIdResponse
}
var file_authentication_proto_depIdxs = []int32{
	3, // 0: protos.GetProjectByIdResponse.members:type_name -> protos.ProjectMembers
	0, // 1: protos.authRpcService.ValidateRequest:input_type -> protos.ValidationRequest
	2, // 2: protos.authRpcService.GetProjectById:input_type -> protos.GetProjectByIdRequest
	5, // 3: protos.authRpcService.GetUserById:input_type -> protos.GetUserByIdRequest
	1, // 4: protos.authRpcService.ValidateRequest:output_type -> protos.ValidationResponse
	4, // 5: protos.authRpcService.GetProjectById:output_type -> protos.GetProjectByIdResponse
	6, // 6: protos.authRpcService.GetUserById:output_type -> protos.GetUserByIdResponse
	4, // [4:7] is the sub-list for method output_type
	1, // [1:4] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_authentication_proto_init() }
func file_authentication_proto_init() {
	if File_authentication_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_authentication_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ValidationRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ValidationResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetProjectByIdRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ProjectMembers); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetProjectByIdResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetUserByIdRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_authentication_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetUserByIdResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_authentication_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   7,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_authentication_proto_goTypes,
		DependencyIndexes: file_authentication_proto_depIdxs,
		MessageInfos:      file_authentication_proto_msgTypes,
	}.Build()
	File_authentication_proto = out.File
	file_authentication_proto_rawDesc = nil
	file_authentication_proto_goTypes = nil
	file_authentication_proto_depIdxs = nil
}
