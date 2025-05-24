// @desc    Delete label
// @route   DELETE /api/v1/labels/:id
// @access  Private
exports.deleteLabel = asyncHandler(async (req, res, next) => {
    const label = await Label.findById(req.params.id);

    if (!label) {
        return next(new ErrorResponse(`Label not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns label
    if (label.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this label`, 401));
    }

    // Use deleteOne instead of remove (which is deprecated)
    await label.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});